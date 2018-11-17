const { end, generateHTML } = require.main.require('./services/utils')
const { pool } = require.main.require('./db')

module.exports = {
  get: async (req, res) => {

    const email = (req.user && req.user.email) ? req.user.email : null
    const template = generateHTML({ email })

    let html = `
    <div class="container">
      <header style="background-image: url('https://assets.adriaan.io/images/maker/privacy-image.svg');">
        <div>
          <h1><a href="/">PRIVACY FIRST PRODUCTS</a></h1>
          <h2 class="fat">A place where you can<br>talk with the creators.</h2>
          <p class="mt-2 small text-muted">← <a href="/">homepage</a></p>
        </div>
      </header>

      <div class="text-content" style="margin-top: -40px;">
        <h5>Why this project?</h5>
        <p>There are a lot of lists out there with privacy first products. But those lists are always a one way streat. You have to trust the source and only get one side of the story. What we are creating is a list of products where you can publicly see what other people are saying about it. We also add features to help upcoming privacy loyal businesses so they can share and communicate about their product.</p>

        <h5 class="mt-5">Can I add my project?</h5>
        <p>Contact us to get yourself listed via <a href="mailto:adriaan@privacyfirstproducts.com">adriaan@privacyfirstproducts.com</a>. Make sure to attach an image of your logo (700 x 350px) which should be on a non-white background. Be sure to have registered on the platform with as many founder/creators of your product and link them in the email. Write a non-marketing description so we can use that on our website. All information provided we can change to match our quality standards.</p>

      </div>
    </div>
    `


    return end(req, res, 200, template + html)
  }
}
