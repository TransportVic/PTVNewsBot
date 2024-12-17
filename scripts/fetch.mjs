import { fetchNewsFormat, fetchImprovementsFormat } from "../fetch-articles.mjs"
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
  twitterKeys = {
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
  let allLinks = [
    ...await fetchNewsFormat('https://www.ptv.vic.gov.au/news-and-events/news/'),
    ...await fetchNewsFormat('https://www.ptv.vic.gov.au/news-and-events/events/'),
    ...await fetchNewsFormat('https://www.ptv.vic.gov.au/news-and-events/media-releases/'),
    ...await fetchImprovementsFormat('https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/bus-and-coach/'),
    ...await fetchImprovementsFormat('https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/train-and-rail/'),
    ...await fetchImprovementsFormat('https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/tram/'),
    ...await fetchImprovementsFormat('https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/train-stations/')
  ]

  for (let link of allLinks) {
    if (articlesSeen.some(article => article.link == link)) continue

    let data = await saveArticle(link)
    if (!data) continue

    console.log(`Found new article ${data.title}`)

    await twitterClient.v2.tweet(`New post from PTV: ${data.title}\n\nRead more at: https://ptv-news.transportvic.me/articles/${data.articleID}`)

    articlesSeen.push({
      link: link,
      title: data.title,
      description: data.articleDescription,
      date: data.date,
      eventImageFile: data.eventImageFile
    })

    fs.writeFile(path.join(__dirname, '../articles/articles.json'), JSON.stringify(articlesSeen, null, 2))
  }
}


await fetchArticles()