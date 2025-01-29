import articlesSeen from '../articles/articles.json' with { type: 'json' }
import fs from 'fs/promises'
import path from "path"
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

String.prototype.format = (function (i, safe, arg) {
  function format () {
    var str = this; var len = arguments.length + 1
    for (i = 0; i < len; arg = arguments[i++]) {
      safe = typeof arg === 'object' ? JSON.stringify(arg) : arg
      str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe)
    }
    return str
  }
  format.native = String.prototype.format
  return format
}())

let baseHTML = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PTV News Articles Feed</title>
    <link rel="stylesheet" href="/assets/index.css">
  </head>
  <body>
  {0}
  {1}
  </body>
  </html>`

let articleHTML = `
<article>
<a href="{3}">
{0}
<div>
<h2 class="art-title">{1}</h2>
<h3 class="art-date">{4}</h3>
<p class="art-desc">{2}</h2>
<p class="art-link">Read More</p>
</div>
</a>
</article>`

let readMore = `<a id="older" href="/articles/old-articles.html">Older Articles Here</a>`

let sorted = articlesSeen.sort((a, b) => b.date.localeCompare(a.date))

let innerHTML = sorted.map(article => {
  let banner = ''
  if (article.eventImageFile) banner = `<img loading="lazy" src="/files/${article.eventImageFile}.jpg">`
  let articleID = (article.date + article.title).replace(/[^\w]/g, '-')

  return articleHTML.format(banner, article.title, article.description, `/articles/${articleID}`, article.date)
})

await fs.writeFile(path.join(__dirname, '../articles/index.html'), baseHTML.format(innerHTML.slice(0, 20).join(''), readMore))
await fs.writeFile(path.join(__dirname, '../articles/old-articles.html'), baseHTML.format(innerHTML.slice(20).join(''), ''))