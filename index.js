const express = require("express");
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');


// app.gets
app.get('/', async (req, res) => {
    let title = "Home";
    let sess_obj = req.session;
    try {
        res.render("", { titledata: title })
    } catch (error) {
        sess_obj.isLoggedIn = false;
        res.render("", { titledata: title })
    }
});
