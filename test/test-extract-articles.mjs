import { extractArticles, extractImprovements } from '../fetch-articles.mjs'
import { expect } from 'chai'
import { readFileSync } from 'fs'

import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let news = readFileSync(path.join(__dirname, '/mock/news.html'))
let bus = readFileSync(path.join(__dirname, '/mock/bus.html'))
let stations = readFileSync(path.join(__dirname, '/mock/stations.html'))

describe('The extractArticles Function on the news data', () => {
  let data = extractArticles(news, 'https://www.ptv.vic.gov.au/news-and-events/news/')

  it('Should correctly find news articles', () => {
    expect(data.length).to.above(0)
  })

  it('Should should be PTV articles', () => {
    expect(data[0]).to.contain('https://www.ptv.vic.gov.au')
  })
})

describe('The extractImprovements Function on the bus data', () => {
  let data = extractImprovements(bus, 'https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/bus-and-coach/')

  it('Should correctly find news articles', () => {
    expect(data.length).to.above(0)
  })

  it('Should should be PTV articles', () => {
    expect(data[0]).to.contain('https://www.ptv.vic.gov.au')
  })

  it('Should should not extract those linking outside', () => {
    expect(data).to.not.contain('https://www.ptv.vic.gov.au/more/travelling-on-the-network/flexiride/#flexiridetarneitnorth')
  })
})

describe('The extractImprovements Function on the station data', () => {
  let data = extractImprovements(stations, 'https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/train-stations/')

  it('Should correctly find news articles', () => {
    expect(data.length).to.above(0)
  })

  it('Should should be PTV articles', () => {
    expect(data[0]).to.contain('https://www.ptv.vic.gov.au')
  })
})