const url = require('url')

const { end, generateHTML } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

module.exports = {
  get: async (req, res) => {
    const email = (req.user && req.user.email) ? req.user.email : null
    const template = generateHTML({ email })

    try {
      const { pathname: path } = url.parse(req.url)
      const slug = path.slice(10)


      const { rows } = await pool.query('SELECT name, description, url, image, slug FROM products WHERE slug = $1', [slug])
      if (!rows || !rows[0]) return end(req, res, 404, `${template}<div class="alert alert-warning" role="alert">This product is not found. <a href="/">Go back to the homepage</a>.</div>`)

      const product = rows[0]

      let html = `<script src="https://cdn.rawgit.com/imsky/holder/master/holder.js"></script>
        <div class="container"><div class="row"><div class="col-lg">
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          ${ product.image ? `<div class="card" style="width: 350px;"><div class="card-img-top"><img style="max-width: 100%;" src="${product.image}" alt="product.name"></div></div>` : `` }
        </div></div></div>`

      return end(req, res, 200, template + html)
    } catch (error) {
      console.error(error)
      return end(req, res, 500, `${template}<div class="alert alert-warning" role="alert">Something went wrong. <a href="/">Go back to the homepage</a>.</div>`)
    }
  }
}

//             ${ product.image ? `<div class="card-img-top" style="width: 100%; height: 100%; background-size: cover; background-position: center center; background-image: url('${product.image}')"></div>` : `<img class="card-img-top" data-src="holder.js/100px225?theme=thumb&bg=f0f9ff&fg=55595c&text=${product.name}" alt="${product.name}">` }
// </div>
