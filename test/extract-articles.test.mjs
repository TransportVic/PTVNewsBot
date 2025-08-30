import { extractArticles } from '../fetch-articles.mjs'
import { expect } from 'chai'
import articles from './sample-data/articles.json' with { type: 'json' }
import nock from 'nock'

describe('extractArticles', () => {
  beforeEach(async function () {
    nock('https://discover-apse2.sitecorecloud.io')
      .post('/discover/v2/191565935')
      .reply(200, articles)
    this.articles = await extractArticles()
  })

  it('finds news articles', function () {
    expect(this.articles.length).to.above(0)
  })

  it('identifies the title', function () {
    expect(this.articles[0].title).to.equal('Industrial action withdrawn')
    expect(this.articles[1].title).to.equal('Public transport works this spring')
  })

  it('identifies the description', function () {
    expect(this.articles[0].description).to.equal('Buses services in Melbourne, Geelong and Ballarat run as normal.')
    expect(this.articles[1].description).to.equal('Work on major transport infrastructure projects may impact the way you travel around Melbourne and across the state.')
  })

  it('identifies date published', function () {
    expect(this.articles[0].date).to.equal('2025-08-25')
    expect(this.articles[1].date).to.equal('2025-08-25')
    expect(this.articles[2].date).to.equal('2025-08-19')
  })
})