const express = require("express");
const app = express();
let session = require('express-session');
const path = require('path');
const { registerUser } = require("./auth");
const { stat } = require("fs");
const { isStrongPassword, isValidEmail } = require("./registration/validation");

const port = 3000;

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
    res.render("pages/home", { titledata: title })
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
    
    const { status } = await usernamePasswordMatches(email, password);
    const message = status === 200 ? "Login successful." : "Login failed.";

    res.send(JSON.stringify({ status, message }));
});