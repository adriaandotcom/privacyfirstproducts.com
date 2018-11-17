const url = require('url')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const { end, getPost, generateHTML } = require.main.require('./services/utils')
const { send } = require.main.require('./services/mailgun')
const { pool } = require.main.require('./db')

const form = `
  <form method="post">
    <h2 class="mb-4">Login</h2>
    <div class="form-group">
      <label for="emailField">Email address</label>
      <input name="email" type="email" class="form-control" id="emailField" placeholder="Enter email address...">
      <small class="form-text text-muted">You will receive a magic link by email.</small>
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
  </form>`

const template = generateHTML()

const randomString = (length = 15) => {
  let string = '', chars
  for (let index = 0; index < length; index++) {
    if (index % 2) chars = 'bcdfghklmnpqrstvwxyz'
    else chars = 'aeiou'
    string += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return string
}

module.exports = {
  get: async (req, res) => {
    const { query: { token } } = url.parse(req.url, true)
    if (!token) return end(req, res, 200, template + form)

    const { rows } = await pool.query('SELECT email FROM users WHERE magic_token LIKE $1', [token])
    if (!rows.length) return end(req, res, 401, `${template}<div class="alert alert-danger" role="alert">User token is invalid, try again</div>${form}`)
    const { email } = rows[0]

    const hash = crypto.createHmac('sha256', process.env.JWT_SECRET).update(email).digest('hex');

    const jwtToken = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 90),
      data: hash
    }, process.env.JWT_SECRET)

    console.log(jwtToken)

    // login
    return end(req, res, 200, template + form + jwtToken)
  },

  post: async (req, res) => {
    const { email } = await getPost(req)

    if (!email || email.trim() === '') return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">Email is empty, try again</div>${form}`)
    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">Your email address is invalid, please try again.</div>${form}`)

    try {
      const { rows } = await pool.query('SELECT FROM users WHERE email LIKE $1', [email])
      if (!rows.length) return end(req, res, 401,  `${template}<div class="alert alert-secondary" role="alert">User is not found, try again</div>${form}`)

      const token = randomString(25)
      await pool.query('UPDATE users SET magic_token = $1 WHERE email LIKE $2', [token, email])

      // Send email with login code
      const text = `Hi there 👋,\n\nHere is you login link: https://privacyfirstproducts.com/login?token=${token}\n\nRegards,\nAdriaan`
      await send({ text, to: email, subject: 'Your link to login on Privacy First Products' })

      return end(req, res, 200,  `${template}<div class="alert alert-success" role="alert">Magic link sent to your inbox, click it to login.</div>${form}`)
    } catch (error) {
      console.error(error)
      const message = (error.message.indexOf('unique constraint') >= 0) ? 'Email is already in use, try other email or login this one.' : error.message
      return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">${message}</div>${form}`)
    }
  }
}
