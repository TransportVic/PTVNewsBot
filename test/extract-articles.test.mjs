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
    expect(this.articles[0].articleDescription).to.equal('Buses services in Melbourne, Geelong and Ballarat run as normal.')
    expect(this.articles[1].articleDescription).to.equal('Work on major transport infrastructure projects may impact the way you travel around Melbourne and across the state.')
  })

  it('identifies date published', function () {
    expect(this.articles[0].date).to.equal('2025-08-25')
    expect(this.articles[1].date).to.equal('2025-08-25')
    expect(this.articles[2].date).to.equal('2025-08-19')
  })

  it('contains the event image', function () {
    expect(this.articles[0].eventImage).to.equal('https://edge.sitecorecloud.io/stategovernc45d-cftw-production-c9ca/media/Project/TransportWebsite/shared/demo/metro-bus-stop-bays-shelter-flag-hybrid.jpg?h=386&iar=0&w=580')
    expect(this.articles[1].eventImage).to.exist
    expect(this.articles[2].eventImage).to.not.exist
  })

  it('includes the article link', function () {
    expect(this.articles[0].link).to.equal('https://transport.vic.gov.au/news-and-resources/news/industrial-action-to-disrupt-buses-in-early-september')
    expect(this.articles[1].link).to.equal('https://transport.vic.gov.au/news-and-resources/news/public-transport-works-this-spring')
  })

  it('includes the article GraphQL id', function () {
    expect(this.articles[0].id).to.equal('931fd71f-ac29-4c10-ab07-cdc263a1c614')
    expect(this.articles[1].id).to.equal('b58827ec-f0da-4b73-ab86-486c7a1a0515')
  })
})