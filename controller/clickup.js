const client = require('../lib/mongolib');
const ObjectId = require('mongodb').ObjectID;
const dbName = process.env.MONGO_DB_NAME;
const clickuplab = process.env.MONGO_DB_COLLECTION_CLICKUP;

function Tasks() {
    const clickup = {};

    const connection = client.connect().then((result) => result.db(dbName));

    clickup.findAll = () => {
		return connection.then((c) => c.collection(clickuplab).find({}).toArray());
	};

	clickup.findOne = (id) => {
		return connection.then((c) => c.collection(clickuplab).findOne({ _id: ObjectId(id) }));
	};

	clickup.findOneByUser = (userId) => {
		return connection.then((c) => c.collection(clickuplab).findOne({ username: userId }));
	};

	clickup.insertOne = (data) => {
		return connection.then((c) => c.collection(clickuplab).insertOne(data));
	};

	clickup.replaceOne = (id, data) => {
		return connection.then((c) => c.collection(clickuplab).replaceOne({ _id: ObjectId(id) }, data));
	};

	clickup.replaceOneByUser = (userId, data) => {
		return connection.then((c) => c.collection(clickuplab).replaceOne({ username: userId }, data));
	};

	clickup.deleteOne = (id) => {
		return connection.then((c) => c.collection(clickuplab).deleteOne({ _id: ObjectId(id) }));
	};

	clickup.deleteOneByUser = (userId) => {
		return connection.then((c) => c.collection(clickuplab).deleteOne({ username: userId }));
	};

	return clickup;
}

module.exports = Tasks();