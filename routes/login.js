const url = require('url')

const { end, getPost, generateHTML, loginAndRedirect, sendLoginToken } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

const form = `

  <form method="post" class="auth">
    <h2 class="mb-4 fat">Login.</h2>
    <div class="form-group">
      <label for="emailField">Email address</label>
      <input name="email" type="email" class="form-control" id="emailField" placeholder="Enter email address...">
      <small class="form-text text-muted">You will receive a magic link by email.</small>
    </div>
    <button type="submit" class="btn my-primary">Login</button>
  </form>

  <p class="mt-4 small text-muted">or <a href="/">return to the homepage</a></p>`

const template = generateHTML()

module.exports = {
  get: async (req, res) => {
    try {
      const { query: { token } } = url.parse(req.url, true)
      if (!token) return end(req, res, 200, template + form)

      const { rows } = await pool.query('SELECT email, extra FROM users WHERE magic_token LIKE $1', [token])
      if (!rows.length) return end(req, res, 401, `${template}<div class="alert alert-danger" role="alert">User token is invalid, try again</div>${form}`)
      const { email, extra } = rows[0]

      const newExtra = (extra && typeof extra === 'object') ? { ...extra, emailValidated: true } : { emailValidated: true }

      await pool.query('UPDATE users SET magic_token = NULL, extra = $1 WHERE magic_token LIKE $2', [JSON.stringify(newExtra), token])

      return loginAndRedirect(res, email)
    } catch (error) {
      console.error(error)
      return end(req, res, 500, `${template}<div class="alert alert-danger" role="alert">${error.message}</div>${form}`)
    }
  },

  post: async (req, res) => {
    const { email } = await getPost(req)

    if (!email || email.trim() === '') return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">Email is empty, try again</div>${form}`)
    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">Your email address is invalid, please try again.</div>${form}`)

    try {
      const { rows } = await pool.query('SELECT FROM users WHERE email LIKE $1', [email])
      if (!rows.length) return end(req, res, 401,  `${template}<div class="alert alert-secondary" role="alert">User is not found, try again</div>${form}`)

      await sendLoginToken(email)

      return end(req, res, 200,  `${template}<div class="alert alert-success" role="alert">Magic link sent to your inbox, click it to login.</div>${form}`)
    } catch (error) {
      console.error(error)
      const message = (error.message.indexOf('unique constraint') >= 0) ? 'Email is already in use, try other email or login this one.' : error.message
      return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">${message}</div>${form}`)
    }
  },
}
