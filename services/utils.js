const url = require('url')
const { parse } = require('querystring')

const end = (req, res, code = 400, body, contentType = 'text/html') => {
  res.statusCode = code
  res.setHeader('content-type', contentType)
  let { pathname } = url.parse(req.url)

  if (code >= 300) console.error(pathname, code)
  else console.error(pathname, code)

  switch (contentType) {
    case 'application/json': {
      if (typeof body === 'string') return res.end(JSON.stringify({ message: body }))
      return res.end(JSON.stringify(body))
    }
    case 'text/html': {
      const html = body
      return res.end(html)
    }
    default: {
      res.setHeader('content-type', 'text/plain')
      return res.end(body)
    }
  }
}

const getPost = req => {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      resolve(parse(body))
    })
  })
}

const generateHTML = (context = {}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Privacy First Products</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
  <!--
  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
  -->
  <script>
    NodeList.prototype.forEach = Array.prototype.forEach;
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
  </script>
  <style>
  html, body {
    margin: 0;
    padding: 0;
    min-height: 100%;
  }
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  body, input, p, textarea {
    font-family: "Kohinoor Bangla", Arial, sans-serif;
    font-size: 16px;
  }
  h1, h2, p {
    word-break: break-word;
    margin-top: 0;
  }
  h2.fat {
    font-size: 55px;
    color: #001836;
    font-weight: bold;
  }
  header {
    background: white;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-repeat: no-repeat;
    background-position: right center;
    background-size: 520px;
    min-height: 450px;
  }
  header a,
  header a:hover {
    color: #93c3fe;
  }
  header h1 {
    font-weight: normal;
    font-size: 30px;
  }
  header h1 a:hover {
    text-decoration: none;
  }
  header > div:first-of-type {
    flex: 1;
  }
  header > div:last-of-type {
    flex: 1;
    width: 500px;
  }
  body {
    padding-bottom: 30px;
  }
  a.card {
    text-decoration: none;
    color: #212529
  }
  a {
    cursor: pointer;
  }
  .media {
    position: relative;
  }
  .media:target::before {
    position: absolute;
    left: -35px;
    top: 7px;
    content: '→';
    font-size: 30px;
  }
  .card {
    box-shadow: 0 0 14px 4px #ced5d659, 0 0px 3px 1px #e9f0f140;
    border: none;
    transition: transform 100ms ease-in;
  }
  .card--scale:hover {
    transform: scale(1.02);
  }
  nav {
    background-color: #6bb8ff;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    padding: 5px 10px;
    color: white;
    display: inline-block;
  }
  nav a,
  nav a:hover {
    color: white;
  }
  nav p {
    margin: 0;
  }
  ul.catagories {
    padding: 0;
    margin: 0;
    list-style-type: none;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
  }
  ul.catagories li {
    display: inline-block;
    padding: 0 25px;
    line-height: 40px;
    border-radius: 10px;
    margin: 15px;
    box-shadow: 0 0 14px 4px #ced5d659, 0 0px 3px 1px #e9f0f140;
    cursor: pointer;
  }
  a.btn-group:hover {
    text-decoration: none;
  }
  form.auth {
    width: 270px;
    margin-top: 100px;
  }
  form.auth button.btn {
    width: 100%;
  }
  .my-primary {
    color: white;
    background-color: #6bb8ff;
  }
  .my-primary:focus, .my-primary:hover{
    color: white;
    background-color: #50a7f7;
  }
  .active.color-analytics { background-color: #c600ff; color: white; }
  .active.color-browser { background-color: #ff2dad; color: white; }
  .active.color-comments { background-color: #00ceff; color: white; }
  .active.color-email { background-color: #ffd200; color: black; }
  .active.color-email-client { background-color: #0068de; color: white; }
  .active.color-home-automation { background-color: #c600ff; color: white; }
  .active.color-messaging { background-color: #ff2dad; color: white; }
  .active.color-password-manager { background-color: #00ceff; color: white; }
  .active.color-productivity { background-color: #ffd200; color: black; }
  .active.color-search { background-color: #0068de; color: white; }
  .active.color-shortener { background-color: #c600ff; color: white; }
  .active.color-social-network { background-color: #ff2dad; color: white; }
  .active.color-vpn { background-color: #00ceff; color: white; }
  </style>
</head>
<body>

<div class="container">
  <nav>
    ${context.email ? `<p>Logged in as ${context.email}</p>` : '<p><a href="/login">Login</a> or <a href="/register">register</a></p>'}
  </nav>
</div>

<script async src="https://cdn.simpleanalytics.io/hello.js"></script>
<noscript><img src="https://api.simpleanalytics.io/hello.gif" alt=""></noscript>`

}

module.exports = {
  end,
  generateHTML,
  getPost
}
