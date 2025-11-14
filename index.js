const express = require("express");
const app = express();
const path = require('path');
const { registerUser } = require("./auth");

const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// GET routes
app.get('/', (req, res) => {
    res.render("pages/home", { titledata: "Home" });
});

app.get('/login', (req, res) => {
    res.render("pages/login", { titledata: "Login" });
});

app.get('/register', (req, res) => {
    res.render("pages/register", { titledata: "Register" });
});

// POST routes
app.post('/register', async (req, res) => {
    const username = req.body.usernameInput;
    const password = req.body.passwordInput;

    await registerUser(username, password);

    res.redirect('/');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log(`Login attempt from: ${username}`);
    res.redirect('/');
});

app.post("/chatbot", (req, res) => {
    res.render("pages/chatbot", { titledata: "Chatbot" });
});

// Start the server
app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
});