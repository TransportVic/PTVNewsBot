import { parseArticle } from '../parse-site.mjs'
import { expect } from 'chai'
import articles from './sample-data/articles.json' with { type: 'json' }
import nock from 'nock'

describe('parseArticles', () => {
  beforeEach(async function () {
    nock('https://edge.sitecorecloud.io/api/graphql/v1')
      .post('/api/graphql/v1')
      .reply(200, articles)

    this.springArticle = await parseArticle({
      title: 'Public transport works this spring',
      description: 'Work on major transport infrastructure projects may impact the way you travel around Melbourne and across the state.',
      date: '2025-08-25',
      eventImage: 'https://edge.sitecorecloud.io/stategovernc45d-cftw-production-c9ca/media/Project/TransportWebsite/shared/a-tram-travelling.jpg?h=693&iar=0&w=1200',
      link: 'https://transport.vic.gov.au/news-and-resources/news/public-transport-works-this-spring',
      id: 'b58827ec-f0da-4b73-ab86-486c7a1a0515'
    })

    this.moreBusesArticle = await parseArticle({
      title: 'More buses more often on route 513, 514 and 517',
      description: 'From 7 September 2025, we’re adding 174 weekly trips across routes 513, 514 and 517 with buses running later into the evening most days of the week.',
      date: '2025-08-15',
      eventImage: null,
      link: 'https://transport.vic.gov.au/news-and-resources/news/more-buses-more-often-on-route-513-514-and-517',
      id: '547ba758-af84-4bc8-b749-9c33922b888f'
    })
  })

  it('gets the article text', function () {
    expect(this.article.articleText).to.contain('Industrial action disrupting some bus routes in Melbourne, Geelong and Ballarat from Monday 1 to Friday 5 September has been withdrawn.')
  })

  it('gets a list of PDFs for archiving', function () {
    expect(this.article.pdfLinks).to.deep.equal([])
  })
})