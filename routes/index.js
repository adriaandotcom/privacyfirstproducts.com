const { end, generateHTML } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

const queryProducts = `
SELECT
  name,
  description,
  url,
  image,
  slug,
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
    let html = `<script src="https://cdn.rawgit.com/imsky/holder/master/holder.js"></script><div class="container"><div class="row">`


    // const { rows: categories } = await pool.query(`SELECT DISTINCT lower(replace(category, ' ', '-')) as category FROM products ORDER BY category`)

    // console.log(categories)

    for (const product of rows) {
      html += `<div class="col-md-4">
        <a href="/products/${product.slug}" class="card mb-4 shadow-sm-del">
          ${ product.image ? `<div class="card-img-top" style="height: 225px; background-size: cover; background-position: center center; background-image: url('${product.image}')"></div>` : `<img class="card-img-top" data-src="holder.js/348x225?theme=thumb&bg=f0f9ff&fg=55595c&text=${product.name}" alt="${product.name}">` }
          <div class="card-body">
            <p class="card-text" style="min-height: 48px;">${ product.description ? product.description : '&nbsp;' }</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <button type="button" class="btn btn-sm btn-outline-secondary">Comment</button>
                <!--<button type="button" class="btn btn-sm btn-outline-secondary">Review</button>-->
                <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
              </div>
              <small class="text-muted">${product.number_of_comments} comments</small>
            </div>
          </div>
        </a>
      </div>`
    }

    html += `</div></div>`

    return end(req, res, 200, template + html)
  }
}
