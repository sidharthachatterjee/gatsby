import { MongoClient } from "mongodb"

function ensureNodeCollection(db) {
  return db.createCollection(`nodes`)
}

let db

function getDb() {
  return db
}

async function start() {
  const uri = `mongodb://localhost:27017/gatsby`
  const mongoClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const client = await mongoClient.connect()
  db = client.db(`gatsby`)

  await ensureNodeCollection(db)
}

module.exports = {
  start,
  getDb,
  saveState: () => {},
}
