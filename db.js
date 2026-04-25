const pg = require('pg')
const { Client } = pg

async function connectDb() {
  const connectionString = process.env.POSTGRES_URI
  const client = new Client({
    connectionString
  })
  await client.connect()
  await client.query('SELECT NOW()')
  console.log("DB Connected Successfully")
}

module.exports = {
  connectDb
}
