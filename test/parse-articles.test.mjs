import { parseArticle } from '../parse-site.mjs'
import { expect } from 'chai'
import articles from './sample-data/articles.json' with { type: 'json' }
import nock from 'nock'

describe('parseArticles', () => {
  beforeEach(async function () {
    nock('https://discover-apse2.sitecorecloud.io')
      .post('/discover/v2/191565935')
      .reply(200, articles)

    this.article = await parseArticle({
      title: 'Industrial action withdrawn',
      description: 'Buses services in Melbourne, Geelong and Ballarat run as normal.',
      date: '2025-08-25',
      eventImage: 'https://edge.sitecorecloud.io/stategovernc45d-cftw-production-c9ca/media/Project/TransportWebsite/shared/demo/metro-bus-stop-bays-shelter-flag-hybrid.jpg?h=386&iar=0&w=580',
      link: 'https://transport.vic.gov.au/news-and-resources/news/industrial-action-to-disrupt-buses-in-early-september'
    })
  })

  it('gets the article text', function () {
    expect(this.article.articleText).to.contain('Industrial action disrupting some bus routes in Melbourne, Geelong and Ballarat from Monday 1 to Friday 5 September has been withdrawn.')
  })

  it('gets a list of PDFs for archiving', function () {
    expect(this.article.pdfLinks).to.deep.equal([])
  })
})