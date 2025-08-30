import { parseArticle } from '../parse-site.mjs'
import { expect } from 'chai'
import springWorks from './sample-data/spring-works.json' with { type: 'json' }
import moreBuses from './sample-data/more-buses.json' with { type: 'json' }
import nock from 'nock'

describe('parseArticles', () => {
  beforeEach(async function () {
    nock('https://edge.sitecorecloud.io')
      .post('/api/graphql/v1')
      .reply(200, springWorks)

    nock('https://edge.sitecorecloud.io')
      .post('/api/graphql/v1')
      .reply(200, moreBuses)

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
    expect(this.springArticle.articleText).to.contain('Buses replace trains between Parliament, Caulfield and Westall from 9pm Friday 29 August to 5am Saturday 6 September 2025.')
    expect(this.moreBusesArticle.articleText).to.contain('On weekends, Route 513 will operate as a short route between Eltham and Heidelberg only.')
  })

  it('gets a list of PDFs for archiving', function () {
    expect(this.springArticle.pdfLinks).to.deep.equal([])
    expect(this.moreBusesArticle.pdfLinks).to.deep.equal([
      'https://edge.sitecorecloud.io/stategovernc45d-cftw-production-c9ca/media/Project/TransportWebsite/Forms/route-513-Eltham---Glenroy-via-Lower-Plenty.pdf',
      'https://edge.sitecorecloud.io/stategovernc45d-cftw-production-c9ca/media/Project/TransportWebsite/Forms/route-514-Eltham---Glenroy-via-Greensborough.pdf',
      'https://edge.sitecorecloud.io/stategovernc45d-cftw-production-c9ca/media/Project/TransportWebsite/Forms/route-517-Northland---St-Helena.pdf'
    ])
  })
})