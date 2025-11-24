import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from './client.js';
const database = await db();

async function registerUser(username, email, plainPassword) {
  const salt = 10; //reduce dcrypt hash length to 10
  const users = database.collection("users"); //connect to db and access "users" collection
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  const doc = {
    username,
    email, 
    hashedPassword,
    registeredAt: new Date()
  };
  
  try {
    await users.insertOne(doc);
    return true;
  } catch (e) {
    console.error('Error inserting user into database', e);
    return false
  }
}

async function authenticateUser(email, inputPassword) {
  const users = database.collection("users"); 
  const findUser = await users.findOne({email: email});

  if (!findUser) {
    return false;
  }

  try {
    return await bcrypt.compare(inputPassword, findUser.hashedPassword);
  } catch (e) {
    console.error(e);
    return false
  }
}

export {
  registerUser,
  authenticateUser
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