// connection to mongo db database //
import 'dotenv/config';
import { MongoClient, ObjectId, Timestamp } from "mongodb";
import bcrypt from 'bcrypt';

const uri = process.env.MONGO_URI; //store connection URI
const client = new MongoClient(uri); //create instance of MongoClient

let db; //stores ref to mongodb database object

// 'users' data operations //

// register new user account details
async function registerUser(username, email, plainPassword) {
  try {
    const salt = 10; //reduce dcrypt hash length to 10
    const users = client.db("chatbot").collection("users"); //connect to db and access "users" collection
    const hashedPassword = await bcrypt.hash(plainPassword, salt); //hashes plainPassword

    const doc = { //create user document to insert
      username, 
      hashedPassword,
      email,
      registeredAt: new Date()
    };
    const result = await users.insertOne(doc); //insert user document into mongodb
    console.log(`User document was inserted with the _id: ${result.insertedId}`); //displays mongodb auto-gen unique id
  }
  catch (e) {
    console.error(e);
  }
}

// compare hash-password to password (for user authentication)
async function authenticateUser(username, inputPassword) {
  try {
    const users = client.db("chatbot").collection("users"); 
    //find user
    const findUser = await users.findOne({name: username}); 
    if (!findUser) { //if user doesn't exist 
      console.log('User does not exist');
      await client.close();
      return false;
    }

     //compare user's hashed password to input password
     const match = await bcrypt.compare(inputPassword, findUser.hashedPassword);
    if (match == true) {
      console.log('Login Successful');
    } else {
      console.log('Incorrect credentials');
    }
  }
  catch (e) {
    console.error(e);
  }
}

// exports //

export {
  registerUser,
  authenticateUser
};

export async function databaseConnection() { //establish database connection (collection pooling)
  if (!db) {
      await client.connect();
      db = client.db('chatbot');
  }
  return db;
}

// to test code //

// register user function
// (async () => {
//   try {
//     const newUser = await registerUser('testuser1', 'testuser1@email.com', 'password123');
//   } catch (error) {
//     console.error('Error creating user', error);
//   }
// }) ();

// authenticate user function
// (async () => {
//   try {
//     console.log(authenticateUser('testuser1', 'password123'));
//   } catch (error) {
//     console.error('Error authenticating user', error);
//   }
// }) ();
