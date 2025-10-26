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
                    "facetid_eyJ0eXBlIjoiZXEiLCJuYW1lIjoibW9kZV9vZl90cmFuc3BvcnQiLCJ2YWx1ZSI6IkFjdGl2ZSBUcmFuc3BvcnQifQ==",
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
  let newsData = await (await fetch('https://discover-apse2.sitecorecloud.io/discover/v2/191565935', {
    method: 'POST',
    headers: {
      'Authorization': '01-4bcb0314-326c6d779f84da500c191d49d5c4a64b34ff868f',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchQuery)
  })).json()

  let rawEventsData = await (await fetch('https://edge.sitecorecloud.io/api/graphql/v1', {
    method: 'POST',
    headers: {
      sc_apikey: "NUN0MExCY1FVSzJGaXh2dEtWck1PemZwSHF0M1JsZCsxYk9lTFpqMkhzcz18c3RhdGVnb3Zlcm5jNDVkLWNmdHctcHJvZHVjdGlvbi1jOWNh",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `query { item(path: "ae4ee801-678d-421d-9a73-27fe9100c22f", language: "en") { rendered } }`
    })
  })).json()

  let eventArticles = rawEventsData.data.item.rendered.sitecore.route.placeholders['headless-main'][0].placeholders['sxa-contentpagemain'][0].placeholders['container-{*}'][1].placeholders['container-{*}'][0].placeholders['column-1-{*}'][0].placeholders['container-{*}']
    .slice(2, -1)
    .flatMap(c => Object.values(c.placeholders['container-{*}'][0].placeholders))
    .flatMap(c => c)
    .map(c => ({
      id: c.dataSource,
      ...c.fields.data.item
    }))

  return newsData.widgets[0].content.filter(Boolean).map(article => ({
    title: article.name.trim(),
    articleDescription: article.meta_description,
    date: moment(article.published_timestamp).format('YYYY-MM-DD'),
    eventImage: article.image_url || null,
    link: article.url,
    id: article.id,
    news: true
  })).concat(eventArticles.map(article => ({
    title: article.title.value.trim(),
    articleDescription: article.description.value,
    date: moment().format('YYYY-MM-DD'),
    eventImage: null,
    link: new URL(article.url.value, 'https://transport.vic.gov.au/').toString().trim(),
    id: article.id,
    event: true 
  })))
}