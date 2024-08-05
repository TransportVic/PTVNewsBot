import articlesSeen from './articles.json' with { type: 'json' }
import checksumFile from '../hash.js'
import fs from 'fs/promises'
import path from "path"
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

for (let article of articlesSeen) {
  let articleID = (article.date + article.title).replace(/[ \/]/g, '-')
  // if (articleID != '2024-06-08Public-transport-for-Subculture:-Saturday-8th-June-2024') continue
  let articleDir = path.join(__dirname, articleID)
  let indexFile = path.join(articleDir, 'index.html')

  let dataFile = path.join(__dirname, '../raw-articles', articleID +'.json')
  let data = JSON.parse(await fs.readFile(dataFile))
  let html = (await fs.readFile(indexFile)).toString()

  if (data.eventImage) {
    let bannerCS = html.match(/\/files\/(\w+)\./)[1]
    data.eventImageFile = bannerCS
    article.eventImageFile = bannerCS
  }
  delete article.hasImage


  // let newDataFile = path.join(__dirname, '../raw-articles', articleID + '.json')
  // await fs.writeFile(newDataFile, JSON.stringify(data))
}
await fs.writeFile('articles.json', JSON.stringify(articlesSeen, null, 2))