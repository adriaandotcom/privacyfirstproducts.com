const { end, generateHTML } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

const queryProducts = `
SELECT
  name,
  description,
  url,
  image,
  slug,
  lower(replace(category, ' ', '-')) as category_slug,
  COUNT(comments.product_id) AS number_of_comments
FROM
  products
  LEFT JOIN comments ON (products.id = comments.product_id)
GROUP BY
  products.id
ORDER BY number_of_comments DESC, name ASC`

module.exports = {
  get: async (req, res) => {

    const email = (req.user && req.user.email) ? req.user.email : null
    const template = generateHTML({ email })

    const { rows } = await pool.query(queryProducts)
    let html = `
    <div class="container">
      <header style="background-image: url('https://assets.adriaan.io/images/maker/privacy-image.svg');">
        <div>
          <h1><a href="/">PRIVACY FIRST PRODUCTS</a></h1>
          <h2 class="fat">Talk about products<br>that care about you.</h2>
        </div>
      </header>
    </div>
    <script src="https://cdn.rawgit.com/imsky/holder/master/holder.js"></script><div class="container">`


    const { rows: categories } = await pool.query(`SELECT DISTINCT lower(replace(category, ' ', '-')) as slug, category FROM products ORDER BY category`)

    html += `<div class="row"><ul class="catagories">`
    for (const { category, slug } of categories) {
      html += `<li data-category=".category-${slug}">${category}</li>`
    }
    html += `</ul>
    </div>

    <script>
    document.querySelectorAll('[data-category]').forEach(function(categoryElement) {
      categoryElement.addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelectorAll('.category').forEach(function(cardElement) { cardElement.style.display = 'none' })
        var selector = event.target.getAttribute('data-category')
        document.querySelectorAll(selector).forEach(function(cardElement) { cardElement.style.display = 'block' })
      }, false);
    })
    </script>

    <div class="row" style="min-height: 800px;">`

    for (const product of rows) {
      html += `<div class="col-md-4 category category-${product.category_slug}">
        <div class="card mb-4">
          ${ product.image ? `<a href="/products/${product.slug}" class="card-img-top" style="height: 225px; background-size: cover; background-position: center center; background-image: url('${product.image}')"></a>` : `<a href="/products/${product.slug}"><img class="card-img-top" data-src="holder.js/100px225?theme=thumb&bg=f0f9ff&fg=55595c&text=${product.name}" alt="${product.name}"></a>` }
          <div class="card-body">
            <p class="card-text" style="min-height: 48px;">${ product.description ? product.description : '&nbsp;' }</p>
            <div class="d-flex justify-content-between align-items-center">
              <a class="btn-group">
                <button type="button" onclick="window.location.href = '/products/${product.slug}#comments'" class="btn btn-sm btn-outline-secondary">Comment</button>
                <button type="button" onclick="window.location.href = '/products/${product.slug}'" class="btn btn-sm btn-outline-secondary">View</button>
              </a>
              <div class="btn-group">
                <button type="button" onclick="window.location.href = '${product.url}'" class="btn btn-sm btn-outline-secondary">Website</button>
              </div>
              <small class="text-muted">${product.number_of_comments} comments</small>
            </div>
          </div>
        </div>
      </div>`
    }

    html += `</div></div>`

    return end(req, res, 200, template + html)
  }
}
