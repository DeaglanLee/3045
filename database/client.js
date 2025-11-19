import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let connection;

async function db() {
    if (!connection) {
        await client.connect();
        connection = client.db('chatbot');
    }
    return connection;
}

export {
    db
}