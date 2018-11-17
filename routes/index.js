const { end } = require.main.require('./services/utils')
const { generateHTML } = require.main.require('./services/utils')

module.exports = {
  get: async (req, res) => {

    const email = (req.user && req.user.email) ? req.user.email : null
    const template = generateHTML({ email })

    const html = `
      <p>Here I will create a list</p>
    `

    return end(req, res, 200, template + html)
  }
}
