const client = require("../lib/mongolib");
const ObjectId = require("mongodb").ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const orgColl = process.env.MONGO_DB_COLLECTION_ORG;

function Organization() {
  const org = {};

  const connection = client.connect().then(result => result.db(dbName));

  org.findAll = () => {
    return connection.then(c => c.collection(orgColl).find({}).toArray());
  };

  org.findOne = id => {
    return connection.then(c => c.collection(orgColl).findOne({ _id: ObjectId(id) }));
  };

  org.insertOne = data => {
    return connection.then(c => c.collection(orgColl).insertOne(data));
  };

  org.replaceOne = (id, data) => {
    return connection.then(c => c.collection(orgColl).replaceOne({ _id: ObjectId(id) }, data));
  };

  org.deleteOne = id => {
    return connection.then(c => c.collection(orgColl).deleteOne({ _id: ObjectId(id) }));
  };

  return org;
}

module.exports = Organization();
