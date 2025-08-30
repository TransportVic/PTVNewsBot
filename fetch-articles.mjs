import moment from 'moment-timezone'
import fetch from "node-fetch"
moment.tz.setDefault('Australia/Melbourne')

const searchQuery = {
  "context": {
    "page": {
      "uri": "/news-and-resources/news"
    }
  },
  "widget": {
    "items": [
      {
        "rfk_id": "cftw_collection_news",
        "search": {
          "content": {},
          "facet": {
            "all": true,
            "types": [
              {
                "name": "news_type"
              },
              {
                "filter": {
                  "type": "or",
                  "values": [
                    "facetid_eyJ0eXBlIjoiZXEiLCJuYW1lIjoibW9kZV9vZl90cmFuc3BvcnQiLCJ2YWx1ZSI6IlB1YmxpYyBUcmFuc3BvcnQifQ=="
                  ]
                },
                "name": "mode_of_transport"
              }
            ]
          },
          "offset": 0,
          "sort": {
            "choices": true,
            "value": [
              {
                "name": "publishedDate_desc"
              }
            ]
          },
          "limit": 10,
          "query": {
            "operator": "or"
          }
        },
        "entity": "content",
        "sources": [
          "1029587"
        ]
      }
    ]
  }
}

export async function extractArticles() {
  let data = await (await fetch('https://discover-apse2.sitecorecloud.io/discover/v2/191565935', {
    method: 'POST',
    headers: {
      'Authorization': '01-4bcb0314-326c6d779f84da500c191d49d5c4a64b34ff868f',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchQuery)
  })).json()

  return data.widgets[0].content.filter(Boolean).map(article => ({
    title: article.name,
    description: article.meta_description,
    date: moment(article.published_timestamp).format('YYYY-MM-DD'),
    eventImage: article.image_url || null,
    link: article.url
  }))
  // let $ = load(pageHTML)
  // let pageURL = url.parse(pageURLStr)

  // let articles = $('.MediaHolderColumn__content')
  // let output = []

  // for (let articleE of articles) {
  //   let article = $(articleE)
  //   let link = $('a.card-link', article).attr('href')

  //   let linkURL = url.parse(link)
  //   if (!linkURL.host) link = `${pageURL.protocol}//${pageURL.host}${linkURL.pathname}`

  //   if (link.includes(pageURLStr)) output.push(link)
  // }
  
  // return output
}