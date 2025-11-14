
// Dummy functions so app still runs
async function getUser(username, password) {
  console.log(`(Mock) Getting user: ${username}`);
  // Return fake data just to simulate a user lookup
  return { username };
}

async function registerUser(username, password) {
  console.log(`(Mock) Registering user: ${username}`);
  // Simulate a "success"
  return { success: true };
}

// Export so index.js can still import them
module.exports = { getUser, registerUser };