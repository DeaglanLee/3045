import 'dotenv/config';
import { ObjectId } from "mongodb";
import { db } from './client';

async function createConversation(userId, title) {
  try {
    const conversations = db().collection("conversations");
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(`${userId}`) : userId;

    const doc = {
      userId: userObjectId,
      title,
      createdAt: new Date()
    };
    const result = await conversations.insertOne(doc);
    return result.insertedId;
  }
  catch (e) {
    console.error(e);
    return null;
  }
}

async function getAllConversations(userId) {
    const conversations = db().collection("conversations");
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(`${userId}`) : userId;
    
  try {
    const findConvos = conversations.find({
      userId: userObjectId
    }).sort({createdAt: -1});

    return await findConvos.toArray();
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function saveMessage(userId, convoId, prompt) {
    const messages = db().collection("messages");
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(`${userId}`) : userId;
    const convoObjectId = ObjectId.isValid(convoId) ? new ObjectId(`${convoId}`) : convoId;
    const timestampDate = new Date();
    const timestampString = `${timestampDate.getHours()}:${timestampDate.getMinutes()}:${timestampDate.getSeconds()}:${timestampDate.getMilliseconds()}`;

    const doc = {
      userId: userObjectId,
      conversationId: convoObjectId,
      timestamp: timestampString,
      prompt,
      response: null
    };

  try {
    const result = await messages.insertOne(doc);
    return result.insertedId;
  }
  catch (e) {
    console.error(e);
    return null;
  }
}

async function getConversationHistory(userId, convoId) {
    const messages = db().collection("messages");
    const userObjectId = ObjectId.isValid(userId) ? new ObjectId(`${userId}`) : userId;
    const convoObjectId = ObjectId.isValid(convoId) ? new ObjectId(`${convoId}`) : convoId;
    
  try {
    const findMsgs = messages.find({
      userId: userObjectId,
      conversationId: convoObjectId
    }).sort({timestamp: -1}).limit(20);

    return await findMsgs.toArray();
  }
  catch (e) {
    return null;
  }
}

export {
  createConversation,
  getAllConversations,
  saveMessage,
  getConversationHistory
};

// to test code //

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