const { end, getPost, generateHTML, sendLoginToken } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

const form = `
  <form method="post" class="auth">
    <h2 class="mb-4 fat">Register.</h2>
    <p class="mb-4">Contribute to others. Thank you.</p>
    <div class="form-group">
      <label for="nameField">Full name</label>
      <input name="name" type="text" class="form-control" id="nameField" placeholder="Enter full name...">
      <small class="form-text text-muted">Please use your real name because of trust.</small>
    </div>
    <div class="form-group">
      <label for="emailField">Email address</label>
      <input name="email" type="email" class="form-control" id="emailField" placeholder="Enter email address...">
      <small class="form-text text-muted">We use this to send you a magic link to login.</small>
    </div>
    <button type="submit" class="btn my-primary">Register</button>
  </form>

  <p class="mt-4 small text-muted">or <a href="/">return to the homepage</a></p>`

const template = generateHTML()

module.exports = {
  get: (req, res) => {
    return end(req, res, 200, template + form)
  },

  post: async (req, res) => {
    const { name, email } = await getPost(req)

    if (!name || !email || name.trim() === '' || email.trim() === '') return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">Email and name are invalid, try again</div>${form}`)
    if (name.indexOf(' ') === -1) return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">Please provide your full name as we want to be transparent.</div>${form}`)
    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">Your email address is invalid, please try again.</div>${form}`)

    try {
      await pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email])

      await sendLoginToken(email, true)

      return end(req, res, 200,  `${template}<div class="alert alert-success" role="alert">Welcome email is sent to your inbox, click the link in the email to finish your registration.</div>${form}`)
    } catch (error) {
      console.error(error)
      const message = (error.message.indexOf('unique constraint') >= 0) ? 'Email is already in use, try other email or login this one.' : error.message
      return end(req, res, 401,  `${template}<div class="alert alert-danger" role="alert">${message}</div>${form}`)
    }
  }
}
