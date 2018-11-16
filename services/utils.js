const url = require('url')

const end = (req, res, code = 400, body, contentType = 'application/json') => {
  res.statusCode = code
  res.setHeader('content-type', contentType)
  let { pathname } = url.parse(req.url)

  if (code >= 300) console.error(pathname, code, JSON.stringify(body))
  else console.error(pathname, code)

  switch (contentType) {
    case 'application/json': {
      if (typeof body === 'string') return res.end(JSON.stringify({ message: body }))
      return res.end(JSON.stringify(body))
    }
    case 'text/html': {
      const html = `<body style="display: flex; flex-direction: column; justify-content: center; height: 90%; align-items: center; font-family: Arial;">
        <p>${body}</p>
      </body>`
      return res.end(html)
    }
    default: {
      res.setHeader('content-type', 'text/plain')
      return res.end(body)
    }
  }
}

module.exports = {
  end
}
