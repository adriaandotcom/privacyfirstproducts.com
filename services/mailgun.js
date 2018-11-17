require('dotenv').config()

const domain = 'privacyfirstproducts.com'
const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: domain })

module.exports.send = (options = {}) => {
  return new Promise(async (resolve, reject) => {
    const defaults = { from: 'Adriaan <adriaan@privacyfirstproducts.com>' }
    const data = { ...defaults, ...options }
    const { to, subject, text } = data

    try {
      if (!to || !subject || !text) throw new Error('No to, subject or text specified')

      mailgun.messages().send(data, function (err, body) {
        if (err) {
          console.error(err)
          return reject(err)
        }
        resolve(body)
      })
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}
