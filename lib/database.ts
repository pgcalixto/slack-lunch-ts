import { MongoClient, ObjectId } from "mongodb";
import config from "../config";

const uri = `mongodb+srv://${config.dbUsername}:${config.dbPassword}@${config.dbClusterUrl}/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connect() {
  return client.connect();
}

async function getExpiredReminders(currentDate: Date) {
  const database = client.db("slack");

  const collection = database.collection("lunchReminders");

  const cursor = await collection.find({
    deleted: false,
    remindDate: { $lt: currentDate }
  });

  const documents: Array<{
    _id: ObjectId,
    lunchId: ObjectId,
    reminderId: string,
    remindDate: Date,
    deleted: boolean
  }> = await cursor.toArray();

  return documents;
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

async function saveLunchReminder({
  lunchId,
  reminderId,
  remindDate,
  deleted = false
}: {
  lunchId: string,
  reminderId: string,
  remindDate: Date,
  deleted?: boolean
}) {
  const database = client.db("slack");

  const collection = database.collection("lunchReminders");

  const document = { lunchId, reminderId, remindDate, deleted };

  await collection.insertOne(document);
}

async function setReminderDeletion(reminderId: ObjectId) {
  const database = client.db("slack");

  const collection = database.collection("lunchReminders");

  const filter = { _id: reminderId };

  const updateDoc = {
    $set: {
      deleted: true
    }
  };

  const result = await collection.updateOne(filter, updateDoc);

  return result;
}

export default {
  connect,
  getExpiredReminders,
  getLunchByStartDate,
  saveLunch,
  saveLunchReminder,
  setReminderDeletion
};
