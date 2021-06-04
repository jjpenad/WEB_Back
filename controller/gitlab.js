const client = require("../lib/mongolib");
const ObjectId = require("mongodb").ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const gitlab = process.env.MONGO_DB_COLLECTION_GITLAB;

function Gitlab() {
  const git = {};

  const connection = client.connect().then(result => result.db(dbName));

  git.findAll = () => {
    return connection.then(c => c.collection(gitlab).find({}).toArray());
  };

  git.findOne = id => {
    return connection.then(c => c.collection(gitlab).findOne({ _id: ObjectId(id) }));
  };

  git.findOneByUser = userId => {
    return connection.then(c => c.collection(gitlab).findOne({ userId: userId }));
  };

  git.insertOne = data => {
    return connection.then(c => c.collection(gitlab).insertOne(data));
  };

  git.replaceOne = (id, data) => {
    return connection.then(c => c.collection(gitlab).replaceOne({ _id: ObjectId(id) }, data));
  };

  git.replaceOneByUser = (userId, data) => {
    return connection.then(c => c.collection(gitlab).replaceOne({ userId: userId }, data));
  };

  git.deleteOne = id => {
    return connection.then(c => c.collection(gitlab).deleteOne({ _id: ObjectId(id) }));
  };

  git.deleteOneByUser = userId => {
    return connection.then(c => c.collection(gitlab).deleteOne({ userId: userId }));
  };

  return git;
}

module.exports = Gitlab();
