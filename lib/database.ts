const { MongoClient } = require("mongodb");
import config from "../config";

const uri = `mongodb+srv://${config.dbUsername}:${config.dbPassword}@${config.dbClusterUrl}/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connect() {
  return client.connect();
}

async function getLunchByStartDate(currentStartDate: Date) {
  const documentLimit = 10;

  const database = client.db("slack");

  const collection = database.collection("lunches");

  const cursor = await collection
    .find({
      endDate: { $gt: currentStartDate }
    })
    .limit(documentLimit);

  const documents = await cursor.toArray();

  return documents;
}

async function saveLunch(startDate: Date, endDate: Date) {
  const database = client.db("slack");

  const collection = database.collection("lunches");

  const document = { startDate, endDate };

  const result = await collection.insertOne(document);

  return result.insertedId;
}

async function saveLunchReminder(
  lunchId: string,
  reminderId: string,
  deleteDate: Date
) {
  const database = client.db("slack");

  const collection = database.collection("lunchReminders");

  const document = { lunchId, reminderId, deleteDate };

  await collection.insertOne(document);
}

export default {
  connect,
  getLunchByStartDate,
  saveLunch,
  saveLunchReminder
};
