const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGO_DB_URL;

const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = mongoClient;
