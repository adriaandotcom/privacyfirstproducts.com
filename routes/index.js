const { end, generateHTML } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

module.exports = {
  get: async (req, res) => {

    const email = (req.user && req.user.email) ? req.user.email : null
    const template = generateHTML({ email })

    const { rows } = await pool.query('SELECT name, description, url, image, slug FROM products ORDER BY category')
    let html = `<script src="https://cdn.rawgit.com/imsky/holder/master/holder.js"></script><div class="container"><div class="row">`

    for (const product of rows) {
      html += `<div class="col-md-4">
        <a href="/products/${product.slug}" class="card mb-4 shadow-sm">
          ${ product.image ? `<div class="card-img-top" style="height: 225px; background-size: cover; background-position: center center; background-image: url('${product.image}')"></div>` : `<img class="card-img-top" data-src="holder.js/100px225?theme=thumb&bg=f0f9ff&fg=55595c&text=${product.name}" alt="${product.name}">` }
          <div class="card-body">
            <p class="card-text">${ product.description ? product.description : '' }</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <button type="button" class="btn btn-sm btn-outline-secondary">Comment</button>
                <button type="button" class="btn btn-sm btn-outline-secondary">Review</button>
                <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
              </div>
              <small class="text-muted">x comments</small>
            </div>
          </div>
        </a>
      </div>`
    }

    html += `</div></div>`

    return end(req, res, 200, template + html)
  }
}
