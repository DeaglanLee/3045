const express = require("express");
const session = require('express-session');
const path = require('path');

const { authenticateUser } = require("./database/auth");
const {
    saveMessage,
    getAllConversations,
    getConversationHistory,
    createConversation
} = require("./database/conversations");
const { isStrongPassword, isValidEmail } = require("./registration/validation");

const port = 3000;
const app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false, 
    cookie: { secure: false, maxAge: 3600000 } 
}));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// GETS
app.get('/', async (req, res) => {
    let title = "Home";
    res.render("pages/home", { titledata: title });
});

app.get("/login", async (req, res) => {
    let title = "Login";
    res.render("pages/login", { titledata: title });
});

app.get("/register", async (req, res) => {
    let title = "Register";
    res.render("pages/register", { titledata: title });
});


// POSTS
app.post("/registerUser", async (req, res) => {
    const email = req.body.emailInput;
    const password = req.body.passwordInput;

    if (!isValidEmail(email)) {
        res.send(JSON.stringify({
            status: 400,
            message: "Invalid email format."
        }));
        return;
    }
    
    if (!isStrongPassword(password)) {
        res.send(JSON.stringify({
            status: 400,
            message: "Password is not strong enough."
        }));
        return;
    }

    const { status } = await registerUser(email, password);
    const message = status === 201 ? "Registration successful." : "Registration failed.";

    res.send(JSON.stringify({ status, message }));
});

app.post("/loginUser", async (req, res) => {
    const { email, password } = req.body; 
    
    const authenticated = await authenticateUser(email, password);
    const message = authenticated ? "Login successful." : "Login failed.";

    res.send(JSON.stringify({ status: 401, message }));
});

app.post("/sendMessage", async (req, res) => {
    const { email, prompt, conversationId } = req.body;

    const promptId = await saveMessage(email, conversationId, prompt);
    if (!promptId) {
        res.send(JSON.stringify({ status: 500, message: "Error saving prompt to database." }));
        return;
    }

    const { status, response } = await sendMessageToGemini(prompt);

    if (status !== 200) {
        res.send(JSON.stringify({ status, message: "Error communicating with Gemini API." }));
        return;
    }

    const responseId = await saveMessage(email, conversationId, response);
    if (!responseId) {
        res.send(JSON.stringify({ status: 500, message: "Error saving response to database." }));
        return;
    }

    res.send(JSON.stringify({ status, response }));
});

app.post("/getConversations", async (req, res) => {
    const { email } = req.body;

    const conversations = await getAllConversations(email);
    if (!conversations) {
        res.send(JSON.stringify({ status: 500, message: "Error retrieving conversations." }));
        return;
    }

    res.send(JSON.stringify({ status: 200, conversations }));
});

app.post("/getConversationHistory", async (req, res) => {
    const { email, conversationId } = req.body;

    const history = await getConversationHistory(email, conversationId);
    if (!history) {
        res.send(JSON.stringify({ status: 500, message: "Error retrieving conversation history." }));
        return;
    }

    res.send(JSON.stringify({ status: 200, history }));
});

app.post("/createConversation", async (req, res) => {
    const { email, conversationName } = req.body;

    const conversationId = await createConversation(email, conversationName);
    if (!conversationId) {
        res.send(JSON.stringify({ status: 500, message: "Error creating conversation." }));
        return;
    }

    res.send(JSON.stringify({ status: 201, conversationId }));
});