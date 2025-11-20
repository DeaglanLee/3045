import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import { authenticateUser, registerUser } from "./database/auth.js";
import { isStrongPassword, isValidEmail } from "./registration/validation.js";
import {
  saveMessage,
  getAllConversations,
  getConversationHistory,
  createConversation,
} from "./database/conversations.js";
import { sendMessageToGemini } from "./gemini.js";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;


// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 },
  })
);

// GET routes
app.get('/', (req, res) => {
    res.render("pages/home", { titledata: "Home" });
});

app.get('/login', (req, res) => {
    const error = req.session.loginError || null;
    const oldInput = req.session.oldInput || {};

    req.session.loginError = null;
    req.session.oldInput = null;

    res.render("pages/login", { titledata: "Login", error, oldInput });
});

app.get('/register', (req, res) => {
    res.render("pages/register", { titledata: "Register" });
});

app.get("/chatbot", (req, res) => {
    console.log("Session User: ", req.session.user);
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("pages/chatbot", { titledata: "Chatbot" });
});

app.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/login");
    });
});



// POSTS
app.post("/registerUser", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

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

    const authenticated = await registerUser(email, password);
    if (authenticated) {
        req.session.user = email; // Store user email in session
        res.redirect("/chatbot");
        return;
    }

    res.send(JSON.stringify({ status: 401, message }));
});

app.post("/loginUser", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    
    const authenticated = await authenticateUser(email, password);
    const message = authenticated ? "Login successful." : "Login failed.";
    if (authenticated) {
        req.session.user = email;
        res.redirect("/chatbot");
        return;
    }else {
        req.session.loginError = "Invalid credentials. Please try again.";
        req.session.oldInput = { username: email };

        res.redirect("/login");
    }

    res.send(JSON.stringify({ status: 401, message }));
});

app.post("/sendMessage", async (req, res) => {
    const { prompt, conversationId } = req.body;
    const email = req.session.user;

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

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});