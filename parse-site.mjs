import fetch from "node-fetch"
import { load } from "cheerio"
import moment from "moment"

import sanitize from "sanitize-html"
import url from 'url'

import { distance } from "fastest-levenshtein"

async function parseSite(url) {
  let data = await (await fetch(url)).text()
  return parseHTML(data, url)
}

parseSite.parseHTML = parseHTML
let dateFormat = 'D MMM YYYY'

function parseHTML(html, articleURLStr) {
  if (html.includes('Sorry - Page Not Found')) return null

  let $ = load(html)
  let articleURL = url.parse(articleURLStr)

  let title = $('div.col-12 h2.mb-2').text().trim()
  if (!title) title = $('.ContentPage__main > h1').text().trim()
  if (!title) {
    let heroH1 = $('.transport__model__element__module__modulehero div.hero h1, .transport__model__element__module__modulehero div.hero h2')
    if (heroH1.length) title = $(heroH1[0]).text().trim()
  }
  if (!title) title = $('[data-cy="hero-title"]').text().trim()

  let date
  let dateText = $('.MediaPage__date').text().trim()
  if (dateText.length) date = moment(dateText, 'D MMM YYYY')
  if ($('[data-cy="updated-date"] time').length) {
    date = moment($('[data-cy="updated-date"] time').attr('datetime'))
  }

  let images = $('img')
  for (let imageE of images) {
    let image = $(imageE)
    if (!image.attr('src')) continue

    let imageURL = url.parse(image.attr('src'))
    if (!imageURL.host) image.attr('src', `${articleURL.protocol}//${articleURL.host}${imageURL.pathname}`)
  }

  let image = $('.MediaPage__thumb.col-12 img')
  let eventImage = image.length ? image.attr('src') : null

  if (!eventImage) {
    let heroImage = $('.transport__model__element__module__modulehero .hero img')
    if (heroImage.length) eventImage = heroImage.attr('src')
  }

  let categorySpan = $('.MediaPage__term.col-12 p span')
  let category = Array.from(categorySpan).map(s => $(s).text().replace('>', '').trim())

  let additionalInfoH2 = $('h2:has(a#additionalinfo)')
  if (!additionalInfoH2.length) {
    let h2s = $('h2')
    for (let h2 of h2s) {
      if ($(h2).text().trim().toLowerCase() === 'additional information') {
        additionalInfoH2 = $(h2)
        break
      }
    }
  }

  if (additionalInfoH2.length) {
    let siblings = Array.from(additionalInfoH2.parent().children())
    let index = siblings.indexOf(additionalInfoH2[0])
    for (let element of siblings.slice(index)) $(element).remove()
  }

  let articleBody = $('.element.dnadesign__elemental__models__elementcontent .content-element__content')
  if (!articleBody.length) articleBody = $('.transport__model__element__module__moduletextblock .content-box')
  if (!articleBody.length) articleBody = $('.transport__model__element__module__modulesectiondescription .content')
  if (!articleBody.length) articleBody = $('.rpl-content')

  let testImage = $('.element.transport__model__element__elementimage:first-child img')
  if (testImage.length && !eventImage) {
    eventImage = testImage.attr('src')
    testImage.parent().remove()
  }

  let firstImg = $('> :first-child img', articleBody)
  if (firstImg.length && !eventImage) {
    eventImage = firstImg.attr('src')
    firstImg.parent().remove()
  }
  
  let first = articleBody[0]
  let originalHTML = $(first).html()
  for (let subsequent of articleBody.slice(1)) {
    originalHTML += $(subsequent).html()
    $(subsequent).remove()
  }
  $(first).html(originalHTML)

  let links = $('a', articleBody)
  let pdfLinks = []
  let imgLinks = []

  for (let linkE of links) {
    let link = $(linkE)
    let href = link.attr('href')

    if (href) { // Actual links and not anchors for jumping
      let hrefURL = url.parse(href)

      if (!hrefURL.host) { // Update to become absolute URL
        href = `${articleURL.protocol}//${articleURL.host}${href}`
        link.attr('href', href)
        hrefURL = url.parse(href)
      }

      if (hrefURL.protocol !== 'https:') continue
      
      if (hrefURL.origin === articleURL.origin && hrefURL.pathname === articleURL.pathname && hrefURL.hash) {
        // Update anchor links to just the hash
        link.attr('href', hrefURL.hash)
      } else if (hrefURL.hash && !link.attr('id') && !link.text().trim()) {
        link.remove()
      } else if (hrefURL.pathname.endsWith('.pdf') || (hrefURL.host === 'www.vline.com.au' && hrefURL.pathname.startsWith('/getattachment'))) {
        pdfLinks.push(href)
      } else if (hrefURL.pathname.endsWith('.jpg') || hrefURL.pathname.endsWith('.docx')) {
        imgLinks.push(href)
      }
    }
  }

  let articleImages = $('img', articleBody)

  for (let imgE of articleImages) {
    let img = $(imgE)
    let src = img.attr('src')

    if (src.includes('/assets/page-media/Images/Operator-logos/')) {
      let iconName = img.attr('alt').slice(0, -5).replace(/ /g, '-').toLowerCase()
      img.attr('src', `/assets/operator-logos/${iconName}.svg`)
      img.attr('width', '')
      img.attr('height', '')
    } else {
      imgLinks.push(src)
    }
  }

  let articleContent = sanitize(articleBody.html(), {
    allowedTags: sanitize.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      a: [ 'href', 'name', 'target', 'id' ]
    }
  })
  
  let articleText = articleBody.text().trim()
  let articleDescription = $('meta[name=description]').attr('content')
  let heroDescription = $('.transport__model__element__module__modulehero div.hero h1 ~ p, .transport__model__element__module__modulehero div.hero h2 ~ p')
  if (!heroDescription.length) heroDescription = $('[data-cy="hero-summary"]')

  if (heroDescription.length) {
    articleDescription = heroDescription.text()
  } else {
    let firstParagraph = $('p:first-of-type', articleBody).first()
    let firstParaText = firstParagraph.text()

    let cutoffLength = Math.min(firstParaText.length, articleDescription.length)

    let matchingFirstParaText = firstParaText.slice(0, cutoffLength)
    let matchingDescriptionText = articleDescription.slice(0, cutoffLength)

    let strDist = distance(matchingFirstParaText, matchingDescriptionText)

    if (strDist > 50) { // Means the description is potentially wrong
      articleDescription = firstParaText
    }
  }

  if (!date) { // Try and find a date
    let possibleDate1 = articleText.slice(0, 50).match(/([0123]?\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*( \d{4})?/)
    let possibleDate2 = articleDescription.match(/([0123]?\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*( \d{4})?/)

    let possibleDate3 = articleText.slice(0, 50).match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* ([0123]?\d) (\d{4})/)
    let possibleDate4 = articleDescription.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* ([0123]?\d) (\d{4})/)

    let goodDatesDMY = [ possibleDate1, possibleDate2 ].filter(Boolean).sort((a, b) => b.length - a.length)
    let goodDatesMDY = [ possibleDate3, possibleDate4 ].filter(Boolean).sort((a, b) => b.length - a.length)

    if (goodDatesDMY[0]) {
      let goodDate = goodDatesDMY[0]
      let day = goodDate[1], month = goodDate[2], year = goodDate[3]
      if (!year) year = new Date().getFullYear().toString() // Simple fallback
      date = moment(`${day} ${month} ${year.trim()}`, dateFormat)
    } else if (goodDatesMDY[0]) {
      let goodDate = goodDatesDMY[0]
      let day = goodDate[2], month = goodDate[1], year = goodDate[3]
      date = moment(`${day} ${month} ${year.trim()}`, dateFormat)
    } else {
      let modified = $('meta[name="dcterms.modified"]')
      if (modified.length) date = moment(modified.attr('content'))
      else date = moment()
    }
  }

  date = moment().format('YYYY-MM-DD')

  return {
    title,
    date: date ? date.format('YYYY-MM-DD') : '',
    eventImage,
    articleContent,
    articleText,
    articleDescription,
    pdfLinks,
    imgLinks,
    category
  }
}

export default parseSite