const express = require("express");
const app = express();
const path = require('path');
const { registerUser } = require("./auth");

const port = 3000;

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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
app.post("/register", async (req, res) => {
    const email = req.body.emailInput
    const password = req.body.passwordInput
    registerUser(username, password)
    

    res.render("/");
});

app.post("/login", async (req, res) => {
    const email = req.body.emailInput
    const password = req.body.passwordInput    

    res.redirect("/");
});