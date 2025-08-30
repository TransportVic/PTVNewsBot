import fetch from "node-fetch"
import { parseArticle } from "./parse-site.mjs"
import fs from 'fs/promises'
import path from "path"
import url from 'url'
import checksumFile from './hash.js'
import moment from 'moment-timezone'
moment.tz.setDefault('Australia/Melbourne')

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

String.prototype.format = (function (i, safe, arg) {
  function format () {
    var str = this; var len = arguments.length + 1
    for (i = 0; i < len; arg = arguments[i++]) {
      safe = typeof arg === 'object' ? JSON.stringify(arg) : arg
      str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe)
    }
    return str
  }
  format.native = String.prototype.format
  return format
}())


let baseHTML = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{1}">
    <title>{0}</title>
    <link rel="stylesheet" href="/assets/style.css">
  </head>
  <body>
    {2}
    <article>
      <h1>{0}</h1>
      {4}
    </article>
  </body>
  </html>`

async function saveFile(url, dest) {
  let data = (await fetch(url)).body
  await fs.writeFile(dest, data)
}

async function saveAndChecksum(url, fileName, ext) {
  let filesDir = path.join(__dirname, 'files')
  let tmpDownloadName = path.join(filesDir, fileName)

  await saveFile(url, tmpDownloadName)

  let checksum = await checksumFile('sha1', tmpDownloadName)

  let finalFileName = `${checksum}${ext}`
  let finalName = path.join(filesDir, finalFileName)
  try {
    await fs.stat(finalName)
    await fs.unlink(tmpDownloadName) // Can delete as it already exists
  } catch (e) {
    // Doesnt exist
    await fs.rename(tmpDownloadName, finalName)
  }

  return finalFileName
}

async function saveArticleData(articleData) {
  let articleID = (articleData.date + articleData.title).replace(/[^\w]/g, '-')
  let articleDir = path.join(__dirname, 'articles', articleID)
  try { await fs.mkdir(articleDir) } catch (e) { return articleID }

  let indexFile = path.join(articleDir, 'index.html')
  let dataFile = path.join(__dirname, 'raw-articles', articleID + '.json')
  
  let eventImageChecksum = null
  if (articleData.eventImage) {
    eventImageChecksum = await saveAndChecksum(articleData.eventImage, 'banner', '.jpg')
    articleData.eventImageFile = eventImageChecksum.slice(0, -4)
  }

  for (let pdfFile of articleData.pdfLinks) {
    let pathData = path.parse(url.parse(pdfFile).pathname)
    let fileName = pathData.base.replace(/ /g, '-').replace('.pdf', '') + '.pdf'

    let finalName = await saveAndChecksum(pdfFile, fileName, '.pdf')
    articleData.articleContent = articleData.articleContent.replace(pdfFile, '/files/' + finalName)
  }

  for (let imgFile of articleData.imgLinks) {
    let pathData = path.parse(url.parse(imgFile).pathname)
    let fileName = pathData.base.replace(/ /g, '-')

    let finalName = await saveAndChecksum(imgFile, fileName, pathData.ext)
    articleData.articleContent = articleData.articleContent.replace(imgFile, '/files/' + finalName)
  }

  articleData.articleContent = articleData.articleContent.trim().replace(/[\n\t]/g, '').replace(/  +/g, ' ')

  let indexHTML = baseHTML.format(articleData.title,
    articleData.articleDescription,
    articleData.eventImage ? `<img id="article-banner" src="/files/${eventImageChecksum}" />` : '',
    articleData.articleContent
  )

  await fs.writeFile(indexFile, indexHTML)
  await fs.writeFile(dataFile, JSON.stringify(articleData))

  return articleID
}

async function saveArticle(url) {
  let data = await parseArticle(url)
  
  if (!data) return null
  
  // data.date = moment().format('YYYY-MM-DD')
  data.articleID = await saveArticleData(data)

  return data
}

export default saveArticle
