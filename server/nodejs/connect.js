const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://hwany01:djaakckstm2025@cluster0.azuqrhu.mongodb.net/";
const client = new MongoClient(uri);

async function connect() {
  await client.connect();
  const db = client.db("momchance");
  return { db, client };
}

module.exports = connect