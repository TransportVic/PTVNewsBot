import { extractArticles } from "../fetch-articles.mjs"
import articlesSeen from '../articles/articles.json' with { type: 'json' }
import saveArticle from '../download-site.mjs'
import fs from 'fs/promises'
import path from "path"
import url from 'url'
import { TwitterApi } from 'twitter-api-v2'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let twitterKeys

try {
  twitterKeys = JSON.parse(await fs.readFile(path.join(__dirname, 'twitter-keys.json')))
} catch (e) {
  if (process.env.APP_KEY) twitterKeys = {
    "appKey": process.env.APP_KEY,
    "appSecret": process.env.APP_SECRET,
    "accessToken": process.env.ACCESS_TOKEN,
    "accessSecret": process.env.ACCESS_SECRET,
  }
}

const twitterClient = new TwitterApi(twitterKeys)

function sleep(time) {
  return new Promise(r => setTimeout(r, time))
}

async function fetchArticles() {
  let allArticles = await extractArticles()

  for (let article of allArticles) {
    if (articlesSeen.some(seen => seen.link == article.link)) continue

    let data = await saveArticle(article)
    if (!data) continue

    console.log(`Found new article ${data.title}`)

    if (twitterKeys) await twitterClient.v2.tweet(`New post from PTV: ${data.title}\n\nRead more at: https://ptv-news.transportvic.me/articles/${data.articleID}`)

    articlesSeen.push({
      link: article,
      title: data.title,
      description: data.articleDescription,
      date: data.date,
      eventImageFile: data.eventImageFile
    })

    fs.writeFile(path.join(__dirname, '../articles/articles.json'), JSON.stringify(articlesSeen, null, 2))
  }
}


await fetchArticles()