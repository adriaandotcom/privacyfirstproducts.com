const url = require('url')
const jwt = require('jsonwebtoken')

const { end, options } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

const parseCookies = cookieHeader => {
  const list = {}
  cookieHeader && cookieHeader.split(';').forEach(function (cookie) {
    const parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  })
  return list
}


module.exports.default = async (req, res, routes) => {
  const method = req.method.toLowerCase()

  try {
    // Defaults
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*') // Alles mag
    res.statusCode = 200

    // Get the path without a beginning and trailing slash
    let { pathname: path } = url.parse(req.url)
    path = (path.replace(/[/]+$/, '') || '/index').substr(1)

    const { token } = parseCookies(req.headers.cookie)

    try {
      const { data: email } = jwt.verify(token, process.env.JWT_SECRET)
      const { rows } = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email])
      if (rows && rows[0] && rows[0].email) req.user = rows[0]
    } catch(err) {
      // Do nothing
    }

    path = (path.slice(0, 9) === 'products/') ? 'products' : path

    // Run functions corresponding to request
    const route = routes[path]
    if (!route) return end(req, res, 404, 'Not found')
    if (!route[method] && method !== 'options') return end(req, res, 405, `Method '${method}' not valid`)
    if (method === 'options') return options(req, res, Object.keys(route))
    if (typeof route[method] !== 'function') return end(req, res, 500, `No function specified for method '${method}'`)
    return route[method](req, res)
  } catch (error) {
    console.error(error)
    return end(req, res, 500, 'Server error')
  }
}
