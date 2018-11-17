const http = require('http')
const glob = require('glob')
require('dotenv').config()

const { default: router } = require.main.require('./services/router')
const { migrate } = require.main.require('./db')

const port = process.env.PORT || 3001

glob('./routes/**/*.js', {}, (error, files) => {
  if (error) return console.error(error)

  const routes = {}
  for (const index in files) {
    if (files.hasOwnProperty(index)) {
      const filename = files[index]
      const file = require.main.require(filename)
      routes[filename.slice(9, -3)] = file
    }
  }

  const server = http.createServer((...props) => router(...props, routes))

  server.on('error', err => {
    console.error(`SERVER ERROR: ${err.message}`)
    process.exit(1)
  })

  server.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`)

    try {
      console.time('Migration done')
      const migrated = await migrate()

      if (migrated) console.timeEnd('Migration done')
      else console.log('Migration not needed')
    } catch (e) {
      console.error(e)
    }
  })
})
