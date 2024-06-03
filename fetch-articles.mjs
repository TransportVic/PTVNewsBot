import fetch from "node-fetch"
import { load } from "cheerio"
import url from 'url'

export async function fetchNewsFormat(pageURL) {
  let data = await (await fetch(pageURL)).text()
  return extractArticles(data, pageURL)
}

export function extractArticles(pageHTML, pageURLStr) {
  let $ = load(pageHTML)
  let pageURL = url.parse(pageURLStr)

  let articles = $('.MediaHolderColumn__content')
  let output = []

  for (let articleE of articles) {
    let article = $(articleE)
    let link = $('a.card-link', article).attr('href')

    let linkURL = url.parse(link)
    if (!linkURL.host) link = `${pageURL.protocol}//${pageURL.host}${linkURL.pathname}`

    if (link.includes(pageURLStr)) output.push(link)
  }
  
  return output
}

export async function fetchImprovementsFormat(pageURL) {
  let data = await (await fetch(pageURL)).text()
  return extractImprovements(data, pageURL)
}

export function extractImprovements(pageHTML, pageURLStr) {
  let $ = load(pageHTML)
  let pageURL = url.parse(pageURLStr)

  let articles = $('.element.dnadesign__elemental__models__elementcontent > div > h3 > a, .element.dnadesign__elemental__models__elementcontent > div > h2 > a')
  let output = []

  for (let articleE of articles) {
    let article = $(articleE)
    let link = article.attr('href')

    let linkURL = url.parse(link)
    if (!linkURL.host) link = `${pageURL.protocol}//${pageURL.host}${linkURL.pathname}`
    if (link.includes(pageURLStr)) output.push(link)
  }

  return output
}
