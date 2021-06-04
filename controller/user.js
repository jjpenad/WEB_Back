const client = require("../lib/mongolib");
//const ObjectId = require('mongodb').ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const userColl = process.env.MONGO_DB_COLLECTION_USER;
const gitlab = process.env.MONGO_DB_COLLECTION_GITLAB;

function User() {
  const user = {};

  const connection = client.connect().then(result => result.db(dbName));

  user.findAll = () => {
    return connection.then(c => c.collection(userColl).find({}).toArray());
  };

  user.findAllByOrg = orgId => {
    return connection.then(c => c.collection(userColl).find({ organization: orgId }).toArray());
  };

  user.findOne = id => {
    return connection.then(c => c.collection(userColl).findOne({ _id: id }));
  };

  user.insertOne = data => {
    return connection.then(c => c.collection(userColl).insertOne(data));
  };

  user.replaceOne = (id, data) => {
    return connection.then(c =>
      c
        .collection(userColl)
        .findOneAndUpdate({ _id: id }, { $set: data }, { returnDocument: "after", returnOriginal: false })
    );
  };

  user.deleteOne = id => {
    return connection.then(c => c.collection(userColl).deleteOne({ _id: id }));
  };

  return user;
}

module.exports = User();
