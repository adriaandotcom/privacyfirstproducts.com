const { end } = require.main.require('./services/utils')
const { generateHTML } = require.main.require('./services/utils')
const { description } = require.main.require('./package.json')

module.exports = {
  get: (req, res) => {

    const template = generateHTML()
    const html = `
      <form method="post">
        <h2 class="mb-4">Signup</h2>
        <div class="form-group">
          <label for="nameField">Full name</label>
          <input type="text" class="form-control" id="nameField" placeholder="Enter full name...">
          <small class="form-text text-muted">Please use your real name because of trust.</small>
        </div>
        <div class="form-group">
          <label for="emailField">Email address</label>
          <input type="email" class="form-control" id="emailField" placeholder="Enter email address...">
          <small class="form-text text-muted">You will receive a magic link by email to login.</small>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    `

    return end(req, res, 200, template  + html)
  }
}
