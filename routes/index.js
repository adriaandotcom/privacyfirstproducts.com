const { end } = require.main.require('./services/utils')
const { description } = require.main.require('./package.json')

module.exports = {
  get: (req, res) => {
    return end(req, res, 200, {
      description
    })
  }
}
