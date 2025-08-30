import fetch from "node-fetch"
import sanitize from 'sanitize-html'

export async function parseArticle(article) {
  const data = await (await fetch('https://edge.sitecorecloud.io/api/graphql/v1', {
    method: 'POST',
    headers: {
      "sc_apikey": "NUN0MExCY1FVSzJGaXh2dEtWck1PemZwSHF0M1JsZCsxYk9lTFpqMkhzcz18c3RhdGVnb3Zlcm5jNDVkLWNmdHctcHJvZHVjdGlvbi1jOWNh"
    },
    body: JSON.stringify({
      query: `query { item(path: "${article.id}", language: "en") { rendered } }`
    })
  })).json()

  const articleBody = data.data.item.rendered.sitecore.route.placeholders['headless-main'][0].placeholders['sxa-contentpagemain'][0].placeholders['container-{*}'][1].placeholders['container-{*}'][0].placeholders['column-1-{*}'][0].placeholders['container-{*}'][0].fields.Text.value
  const articleContent = sanitize(articleBody, {
    allowedTags: sanitize.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      a: [ 'href', 'name', 'target', 'id' ]
    }
  })

  const articleText = sanitize(articleBody, {
    allowedTags: [],
    allowedAttributes: {}
  })

  return {
    ...article,
    articleContent,
    articleText,
    pdfLinks: []
  }
}