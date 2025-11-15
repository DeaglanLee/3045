// ---------------------------------------
// connection to the mongodb database
// & data operations
// ---------------------------------------

import 'dotenv/config';
import { MongoClient, ObjectId, Timestamp } from "mongodb";
import bcrypt from 'bcrypt';

const uri = process.env.MONGO_URI; //store connection URI
const client = new MongoClient(uri); //create instance of MongoClient

let db; //stores ref to mongodb database object

export async function databaseConnection() { //establish database connection (collection pooling)
  if (!db) {
      await client.connect();
      db = client.db('chatbot');
  }
  return db;
}


// 'users' data operations //

// register new user account details
async function registerUser(username, email, plainPassword) {
  try {
    const salt = 10; //reduce dcrypt hash length to 10
    const users = client.db("chatbot").collection("users"); //connect to db and access "users" collection
    const hashedPassword = await bcrypt.hash(plainPassword, salt); //hashes plainPassword

    const doc = { //create user document to insert
      username, 
      email, 
      hashedPassword,
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


// 'conversations' data operations //

// store user's new conversations
async function createConversation(userId, title) {
  try {
    const conversations = client.db("chatbot").collection("conversations"); //connect to db and access "conversations" collection
    //as using auto-gen mongodb _id, makes sure userId provided is an objectId
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(`${userId}`) : userId;

    const doc = { //create conversation document to insert
      userId: userObjectId, //reference to specific user
      title, //title of conversation
      createdAt: new Date()
    };
    const result = await conversations.insertOne(doc); //insert conversation document into mongodb
    console.log(`Conversation document was inserted with the _id: ${result.insertedId}`); //displays mongodb auto-gen unique id
  }
  catch (e) {
    console.error(e);
  }
}

// list of all user conversations
async function getAllConversations(userId) {
  try {
    const conversations = client.db("chatbot").collection("conversations"); //connect to db and access "conversations" collection
    //as using auto-gen mongodb _id, makes sure userId provided is an objectId
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(`${userId}`) : userId;
    
    const findConvos = conversations.find({ //find user conversations query
      userId: userObjectId
    }).sort({createdAt: -1}) //sorting to display most recent
    .limit(10); //limit document results to 10

    const userConvosResults = await findConvos.toArray(); //to store one or more document results

    if (userConvosResults.length > 0) { //dsiplay document results to terminal
      console.log(`Found conversation(s) from user '${userId}': `);
        userConvosResults.forEach((result, i) => {
          console.log();
          console.log(` conversation _id:  ${result._id}`);
          console.log(` conversation title: ${result.title}`);
          console.log(` conversation created at: ${result.createdAt}`);
        })
    } else {
      console.log(`No conversations found from user '${userId}'`);
    }
  }
  catch (e) {
    console.error(e);
  }
}


// 'messages' data operations //

// store user messages sent (under user's account and conversation) 
async function sendMessage(userId, convoId, prompt) {
  try {
    const messages = client.db("chatbot").collection("messages"); //connect to db and access "messages" collection
    //as using auto-gen mongodb _id, makes sure userId & conversationId provided are both an objectId
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(`${userId}`) : userId;
    const convoObjectId = ObjectId.isValid(convoId) ? new ObjectId(`${convoId}`) : convoId;
    //getting just the time
    const timestampDate = new Date();
    const timestampString = `${timestampDate.getHours()}:${timestampDate.getMinutes()}:${timestampDate.getSeconds()}:${timestampDate.getMilliseconds()}`;

    const doc = { //create message document to insert
      userId: userObjectId, //reference to specific user
      conversationId: convoObjectId, //reference to specific conversation
      timestamp: timestampString,
      prompt,
      response: null
    };
    const result = await messages.insertOne(doc); //insert message document into mongodb
    console.log(`Message document was inserted with the _id: ${result.insertedId}`); //displays mongodb auto-gen unique id
  }
  catch (e) {
    console.error(e);
  }
}

// list of all user chats for one conversation
async function getConversationHistory(userId, convoId) {
  try {
    const messages = client.db("chatbot").collection("messages"); //connect to db and access "messages" collection
    //as using auto-gen mongodb _id, makes sure userId & conversationId provided are both an objectId
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(`${userId}`) : userId;
    const convoObjectId = ObjectId.isValid(convoId) ? new ObjectId(`${convoId}`) : convoId;
    
    const findMsgs = messages.find({ //find user messages query
      userId: userObjectId,
      conversationId: convoObjectId
    }).sort({timestamp: -1}) //sorting to display most recent
    .limit(20); //limit document results to 20

    const userMsgsResults = await findMsgs.toArray(); //to store one or more document results

    if (userMsgsResults.length > 0) { //dsiplay document results to terminal
      console.log(`Found chat(s) from user '${userId}': `);
        userMsgsResults.forEach((result, i) => {
          console.log()
          console.log(` chat _id:  ${result._id}`);
          console.log(` chat prompt: ${result.prompt}`);
          console.log(` chat timestamp: ${result.timestamp}`);
          //console.log(` chatbot response: ${result.response}`);
        })
    } else {
      console.log(`No chats found from user '${userId}'`);
    }
  }
  catch (e) {
    console.error(e);
  }
}


// exports //
export {
  registerUser,
  authenticateUser,
  createConversation,
  getAllConversations,
  sendMessage,
  getConversationHistory
};


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

// create conversation function
// (async () => {
//   try {
//     const newconversation = await createConversation('691734d9f39a704db9bd3bdd', 'convo_test');
//   } catch (error) {
//     console.error('Error creating conversation', error);
//   }
// }) ();

// get all conversations function
// (async () => {
//   try {
//     console.log(getAllConversations('691734d9f39a704db9bd3bdd'));
//   } catch (error) {
//     console.error('Error finding user conversations', error);
//   }
// }) ();

// send message function
// (async () => {
//   try {
//     const newmessage = await sendMessage('691734d9f39a704db9bd3bdd', '69177ebbb99de8a7e6c30436', 'msg_prompt_test');
//   } catch (error) {
//     console.error('Error creating user', error);
//   }
// }) ();

// get conversation history (list all user chats) function
// (async () => {
//   try {
//     console.log(getConversationHistory('691734d9f39a704db9bd3bdd', '69177ebbb99de8a7e6c30436'));
//   } catch (e) {
//     console.error('Error finding user messages', e);
//   }
// }) ();