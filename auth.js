// import db
import { MongoClient } from "mongodb";

const uri = "<connection string uri>";
const client = new MongoClient(uri);


async function run() {
    try {
      // Connect to the "sample_mflix" database and access its "movies" collection
      const database = client.db("sample_mflix");
      const users = database.collection("users");
      
      // Create a document to insert
      const doc = {
        username: "Charade",
        email: ["Comedy", "Romance", "Thriller"],
        created_date: ""
      }
      // Insert the defined document into the "movies" collection
      const result = await users.insertOne(doc);
      // Print the ID of the inserted document
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } finally {
       // Close the MongoDB client connection
      await client.close();
    }
  }
  // Run the function and handle any errors
  run().catch(console.dir);

async function usernamePasswordMatches(username, password) {
    
}

async function registerUser(username, password) {
    
}

export { usernamePasswordMatches, registerUser };