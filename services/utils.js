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
  <style>
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
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
  header {
    width: 100%;
    background: green;
    color: white;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
  }
  body {
    margin-bottom: 30px;
  }
  </style>
</head>
<body>

<header>
  <h1>Privacy First Products</h1>
  ${context.email ? `<p>Logged in as ${context.email}</p>` : ''}
</header>

<script async src="https://cdn.simpleanalytics.io/hello.js"></script>
<noscript><img src="https://api.simpleanalytics.io/hello.gif" alt=""></noscript>`
}

module.exports = {
  end,
  generateHTML,
  getPost
}
