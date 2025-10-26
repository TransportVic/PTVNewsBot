import fetch from 'node-fetch'
import sanitize from 'sanitize-html'

function traverse(container) {
  if (container.componentName == 'RichText') return [container]
  if (container.componentName == 'Container') return container.placeholders['container-{*}'].flatMap(traverse)
  return []
}

export async function parseArticle(article) {
  const data = await (await fetch('https://edge.sitecorecloud.io/api/graphql/v1', {
    method: 'POST',
    headers: {
      sc_apikey: "NUN0MExCY1FVSzJGaXh2dEtWck1PemZwSHF0M1JsZCsxYk9lTFpqMkhzcz18c3RhdGVnb3Zlcm5jNDVkLWNmdHctcHJvZHVjdGlvbi1jOWNh",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `query { item(path: "${article.id}", language: "en") { rendered } }`
    })
  })).json()

  const container = data.data.item.rendered.sitecore.route.placeholders['headless-main'][0].placeholders['sxa-contentpagemain'][0].placeholders['container-{*}'][1].placeholders['container-{*}'][0].placeholders['column-1-{*}'][0].placeholders['container-{*}']
  const richTextElements = container.flatMap(traverse)
  const articleBody = richTextElements.map(elem => elem.fields.Text.value).join('\n')

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
  }).trim()

  const articleDescription = sanitize(article.articleDescription, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim()

  const cdnLinks = articleContent.match(/https:\/\/edge.sitecorecloud.io\/[^"]+/g) || []
  const pdfLinks = cdnLinks.filter(link => link.endsWith('.pdf'))
  const otherLinks = cdnLinks.filter(link => !link.endsWith('.pdf'))

  return {
    ...article,
    articleDescription,
    articleContent,
    articleText,
    pdfLinks: pdfLinks,
    imgLinks: otherLinks
  }
}