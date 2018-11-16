const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost/privacyfirstproducts'
const pool = new Pool({ connectionString })

module.exports.migrate = () => {
  return new Promise(async function (resolve, reject) {
    try {
      const scheme = fs.readFileSync(path.resolve(__dirname, 'scheme.sql'), 'UTF-8').toString()
      const currentHash = require('crypto').createHash('sha1').update(scheme).digest('base64')

      // Here we try to find a migration, if this fails we will show an error but continue as well
      let lastHash
      try {
        const { rows: [ row ] } = await pool.query(`SELECT value FROM settings WHERE key = 'migration_hash' LIMIT 1`)
        lastHash = row ? row.value : null
      } catch (err) {
        console.error(err)
        await pool.query(scheme)
        pool.query('INSERT INTO settings (key, value) VALUES ($1, $2)', ['migration_hash', JSON.stringify(currentHash)])
        return resolve(true)
      }

      // Check if there are previous records in our table
      if (lastHash) {
        if (currentHash !== lastHash) {
          await pool.query(scheme)
          pool.query(`UPDATE settings SET value = $1 WHERE key = 'migration_hash'`, [JSON.stringify(currentHash)])
          return resolve(true)
        } else {
          return resolve(false)
        }
      } else {
        await pool.query(scheme)
        pool.query('INSERT INTO settings (key, value) VALUES ($1, $2)', ['migration_hash', JSON.stringify(currentHash)])
        return resolve(true)
      }
    } catch (err) {
      reject(err)
    }
  })
}

module.exports.query = pool.query
module.exports.pool = pool
