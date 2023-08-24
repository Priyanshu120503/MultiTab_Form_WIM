const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
require('dotenv').config();

app = express()
app.use(bodyParser.json());
app.set("view engine", "ejs");

path = "./data.json";

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/register", (req, res) => {
    // res.sendFile(__dirname + "/register.html");
    res.render("register", {api_key: process.env.API_KEY, z_api_key: process.env.ZERO_BOUNCE_API_KEY});
});

app.post("/register", (req, res) => {
    if(!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify([]), (err) => {});
    }
    let usersJson = fs.readFileSync(path, "utf-8");
    let users = JSON.parse(usersJson);
    users.push(req.body);
    usersJson = JSON.stringify(users, 4);
    fs.writeFileSync(path, usersJson, (err) => {if(err) console.log(err); console.log("Updated file")});

    res.redirect("/");
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/success.html");
});

app.get("/show", (req, res) => {
    let usersJson = fs.readFileSync(path, "utf-8");
    let users = JSON.parse(usersJson);
    let keys = ['fName', 'mName', 'lName', 'dob', 'email', 'phone', 'addr1', 'addr2', 'city', 'state', 'pincode', 
    'tenth', 'twelth', 'sem', 'inputSem1', 'inputSem2', 'inputSem3', 'inputSem4', 
    'inputSem5', 'inputSem6', 'inputSem7', 'inputSem8', 'resume'];
    res.render("showData", {users: users, keys: keys});
});


app.listen(5000, () => {console.log("Server listening on port 5000.")});
