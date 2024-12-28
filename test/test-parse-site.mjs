import parseSite from '../parse-site.mjs'
import { expect } from 'chai'
import { readFileSync } from 'fs'

import path from 'path'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let whiteNight = readFileSync(path.join(__dirname, '/mock/white-night.html'))
let extremeHeat = readFileSync(path.join(__dirname, '/mock/extreme-heat.html'))
let afl = readFileSync(path.join(__dirname, '/mock/afl.html'))
let mpk = readFileSync(path.join(__dirname, '/mock/merinda-park.html'))
let albury = readFileSync(path.join(__dirname, '/mock/albury.html'))
let union = readFileSync(path.join(__dirname, '/mock/beg-lil.html'))
let gardiner = readFileSync(path.join(__dirname, '/mock/gardiner.html'))
let latrobe = readFileSync(path.join(__dirname, '/mock/latrobe-street.html'))
let tramContract = readFileSync(path.join(__dirname, '/mock/tram-contract.html'))
let aoNightBus = readFileSync(path.join(__dirname, '/mock/disruption-ao-bus.html'))

describe('The parseHTML Function on the white night data', () => {
  let data = parseSite.parseHTML(whiteNight, 'https://www.ptv.vic.gov.au/news-and-events/events/2024/06/01/public-transport-for-white-night-ballarat-2024/')
  
  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('Public transport for White Night Ballarat 2024')
  })

  it('Should correctly extract the event date', () => {
    expect(data.date).to.equal('2024-06-01')
  })

  it('Should correctly identify the event image', () => {
    expect(data.eventImage).to.not.be.null
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('White Night returns on Saturday 1 June, transforming the streets and venues of Ballarat through illuminations, projections, music, and interactive works. The event runs from 6pm on Saturday to midnight.')
  })

  it('Should correctly parse the article description', () => {
    expect(data.articleDescription).to.contain('White Night returns on 1 June, transforming the streets and venues of Ballarat through illuminations, projections, music, and interactive works.')
  })

  it('Should not contain the PTV additional information footer', () => {
    expect(data.articleText).to.not.contain('Subscribe for weekly travel updates')
  })

  it('Should extract PDF Links for archiving', () => {
    expect(data.pdfLinks).to.not.be.empty
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal(['Events', 'Culture'])
  })
})

describe('The parseHTML Function on the extreme heat data', () => {
  let data = parseSite.parseHTML(extremeHeat, 'https://www.ptv.vic.gov.au/news-and-events/news/2024/03/09/extreme-heat-impacting-vline-train-services-from-saturday-9-march-to-tuesday-12-march-2024/')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('Extreme heat impacting V/Line train services from Saturday 9 March to Tuesday 12 March 2024')
  })

  it('Should correctly extract the event date', () => {
    expect(data.date).to.equal('2024-03-09')
  })

  it('Should correctly identify the event image', () => {
    expect(data.eventImage).to.be.null
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('Hot weather is forecast for parts of Victoria from Saturday 9 March to Tuesday 12 March 2024. Extreme heat timetables will be operating across parts of the V/Line network.')
  })

  it('Should correctly parse the article description', () => {
    expect(data.articleText).to.contain('Hot weather is forecast for parts of Victoria from Saturday 9 March to Tuesday 12 March 2024. Extreme heat timetables will be operating across parts of the V/Line network.')
  })

  it('Should extract PDF Links for archiving', () => {
    expect(data.pdfLinks).to.not.be.empty
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal(['Travelling in Victoria', 'Regional Victoria'])
  })

  it('Should not contain the PTV additional information footer', () => {
    expect(data.articleText).to.not.contain('Subscribe for weekly travel updates')
  })
})

describe('The parseHTML Function on the AFL data', () => {
  let data = parseSite.parseHTML(afl, 'https://www.ptv.vic.gov.au/news-and-events/events/2024/05/31/public-transport-for-round-12-of-the-2024-afl-season/')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('Public transport for Round 12 of the 2024 AFL Season')
  })

  it('Should correctly extract the event date', () => {
    expect(data.date).to.equal('2024-05-31')
  })

  it('Should not contain PDF Links for archiving', () => {
    expect(data.pdfLinks).to.be.empty
  })

  it('Should not contain the journey planner', () => {
    expect(data.articleContent).to.not.contain('journey-planner-form')
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal(['Events', 'Sport'])
  })

  it('Should not contain the PTV additional information footer', () => {
    expect(data.articleText).to.not.contain('Subscribe for weekly travel updates')
  })
})


describe('The parseHTML Function on the merinda park data', () => {
  let data = parseSite.parseHTML(mpk, 'https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/bus-and-coach/new-bus-interchange-at-merinda-park-station/')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('New bus interchange at Merinda Park Station')
  })

  it('Should have a date', () => {
    expect(data.date).to.equal('2024-06-16')
  })

  it('Should correctly identify the event image', () => {
    expect(data.eventImage).to.be.null
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('From Sunday 16 June, routes 863 Endeavour Hills SC – Cranbourne West via Hallam Road and 881 Merinda Park Station – Clyde North will have minor route and timetable changes to access the new bus interchange at Merinda Park Station.')
  })

  it('Should correctly parse the article description', () => {
    expect(data.articleDescription).to.contain('From Sunday 16 June 2024, routes 863 Endeavour Hills SC – Cranbourne West via Hallam Road and 881 Merinda Park Station – Clyde North will have minor route and timetable changes to access the new bus interchange at Merinda Park Station.')
  })

  it('Should not contain the PTV additional information footer', () => {
    expect(data.articleText).to.not.contain('Subscribe for weekly travel updates')
  })

  it('Should extract PDF Links for archiving', () => {
    expect(data.pdfLinks).to.not.be.empty
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal([])
  })
})

describe('The parseHTML Function on the albury data', () => {
  let data = parseSite.parseHTML(albury, 'https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/train-and-rail/timetable-changes-on-the-albury-line/')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('Timetable changes on the Albury line')
  })

  it('Should have a date', () => {
    expect(data.date).to.equal('2022-08-02')
  })

  it('Should correctly identify the event image', () => {
    expect(data.eventImage).to.not.be.null
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('The Australian Rail Track Corporation is renewing tracks and undertaking drainage works in the South Dynon area to improve safety and reliability for V/Line passenger rail services between Melbourne and Albury.')
  })

  it('Should correctly parse the article description', () => {
    expect(data.articleDescription).to.contain('The Australian Rail Track Corporation is renewing tracks and undertaking drainage works in the South Dynon area to improve safety and reliability for V/Line passenger rail services between Melbourne and Albury.')
  })

  it('Should not contain the PTV additional information footer', () => {
    expect(data.articleText).to.not.contain('Subscribe for weekly travel updates')
  })

  it('Should extract PDF Links for archiving', () => {
    expect(data.pdfLinks).to.not.be.empty
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal([])
  })
})

describe('The parseHTML Function on the union data', () => {
  let data = parseSite.parseHTML(union, 'https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/train-and-rail/timetable-changes-on-the-belgrave-and-lilydale-lines/')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('Timetable changes on the Belgrave and Lilydale lines')
  })

  it('Should have a date', () => {
    expect(data.date).to.equal('2023-05-28')
  })

  it('Should correctly identify the event image', () => {
    expect(data.eventImage).to.not.be.null
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('The new Union Station has opened on the Belgrave and Lilydale lines. Services will now stop at Union Station with an additional three morning and three evening services on weekdays.')
  })

  it('Should correctly parse the article description', () => {
    expect(data.articleDescription).to.contain('From Sunday 28 May 2023, there will be new train timetables for the Belgrave and Lilydale lines.')
  })

  it('Should not contain the PTV additional information footer', () => {
    expect(data.articleText).to.not.contain('Subscribe for weekly travel updates')
  })

  it('Should extract PDF Links for archiving', () => {
    expect(data.pdfLinks).to.be.empty
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal([])
  })
})

describe('The parseHTML Function on the gardiner data', () => {
  let data = parseSite.parseHTML(gardiner, 'https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/tram/gardiner-tram-substation/')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('Gardiner tram substation')
  })

  it('Should have a date', () => {
    expect(data.date).to.equal('2023-11-06')
  })

  it('Should correctly identify the event image', () => {
    expect(data.eventImage).to.be.null
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('We’re investing in new and accessible trams that are better for passengers and the environment. This allows us to progressively retire the ageing, high-floor fleet.')
  })

  it('Should correctly parse the article description', () => {
    expect(data.articleDescription).to.contain('We’re revitalising Melbourne’s tram network, meeting the city’s future needs and increased demands on the tram network.')
  })

  it('Should extract PDF Links for archiving', () => {
    expect(data.pdfLinks).to.be.empty
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal([])
  })
})

describe('The parseHTML Function on the latrobe street data', () => {
  let data = parseSite.parseHTML(latrobe, 'https://www.ptv.vic.gov.au/footer/about-ptv/improvements-and-projects/tram/redesign-of-la-trobe-tram-stop-upgrade/')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('La Trobe Street tram stop upgrade')
  })

  it('Should have a date', () => {
    expect(data.date).to.equal('2024-05-28')
  })

  it('Should correctly identify the event image', () => {
    expect(data.eventImage).to.not.be.null
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('Making our public transport network accessible to all Victorians is a priority, which is why creating more accessible transport options is a key part of our $100 billion transport infrastructure program.')
  })

  it('Should correctly parse the article description', () => {
    expect(data.articleDescription).to.contain(`We're delivering 12 level-access tram stops at six locations along La Trobe Street to improve accessibility, passenger safety and service reliability.`)
  })

  it('Should extract PDF Links for archiving', () => {
    expect(data.pdfLinks).to.be.empty
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal([])
  })
})

describe('The parseHTML Function on the tram contract data', () => {
  let data = parseSite.parseHTML(tramContract, 'https://www.vic.gov.au/melbourne-tram-refranchising?misdirected=1')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('Melbourne Tram Refranchising')
  })

  it('Should have a date', () => {
    expect(data.date).to.equal('2024-06-28')
  })

  it('Should correctly identify the event image', () => {
    expect(data.eventImage).to.be.null
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('The 18-month competitive procurement process provided time to deliver reform and the opportunity to drive best value from one of Victoria’s largest')
  })

  it('Should correctly parse the article description', () => {
    expect(data.articleDescription).to.contain('The Victorian government has awarded a new long term service contract')
  })

  it('Should extract PDF Links for archiving', () => {
    expect(data.pdfLinks).to.be.empty
  })

  it('Should extract the category', () => {
    expect(data.category).to.deep.equal([])
  })
})

describe('The parseHTML Function on the Australian Open Nigth Bus Disruptions article', () => {
  let data = parseSite.parseHTML(aoNightBus, 'https://www.ptv.vic.gov.au/disruptions/night-buses-for-the-australian-open-2025/')

  it('Should correctly extract the event name', () => {
    expect(data.title).to.equal('Australian Open 2025 night buses')
  })

  it('Should correctly parse the article text', () => {
    expect(data.articleText).to.contain('This year for the first time, we\'ll be providing bus services on 15 popular transport routes')
  })
})