const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { jsPDF } = require("jspdf");
const { get } = require("http");
require('dotenv').config();

app = express()
app.use(bodyParser.json());
app.set("view engine", "ejs");

path = "./data.json";

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/register", (req, res) => {
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

    const doc = new jsPDF();
    doc.text("Data Entered", 10, 10);
    let i = 30;
    for(let key in req.body) {
        doc.text(key.toUpperCase() + ": " + req.body[key], 10, i);
        i += 10;
    }
    doc.save('data.pdf')

    res.redirect("/");
});

app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/success.html");
});

app.get("/report", (req, res) => {
    res.sendFile(__dirname + "/data.pdf");
})

app.get("/show", (req, res) => {
    let usersJson = fs.readFileSync(path, "utf-8");
    let users = JSON.parse(usersJson);
    let keys = ['fName', 'mName', 'lName', 'dob', 'email', 'phone', 'addr1', 'addr2', 'city', 'state', 'pincode', 
    'tenth', 'twelth', 'sem', 'inputSem1', 'inputSem2', 'inputSem3', 'inputSem4', 
    'inputSem5', 'inputSem6', 'inputSem7', 'inputSem8', 'resume'];
    res.render("showData", {users: users, keys: keys});
});

app.get("/analysis", async (req, res) => {
	let usersJson = fs.readFileSync(path, "utf-8");
	let users = JSON.parse(usersJson);
	let keys = ['fName', 'mName', 'lName', 'dob', 'email', 'phone', 'addr1', 'addr2', 'city', 'state', 'pincode',
	'tenth', 'twelth', 'sem', 'inputSem1', 'inputSem2', 'inputSem3', 'inputSem4',
	'inputSem5', 'inputSem6', 'inputSem7', 'inputSem8', 'resume'];

	let semMap = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8};
	let genderData = {'Male': 0, 'Female': 0, 'Other': 0};
	let semWiseData = {'inputSem1': [], 'inputSem2': [], 'inputSem3': [], 'inputSem4': [], 'inputSem5': [], 'inputSem6': [], 'inputSem7': [], 'inputSem8': []};
	let location = {};
    let taken = 0;

    await users.forEach(async (user, index) => {
        genderData[user['gender']] += 1;

        for(let i = 1; i < semMap[user['sem']]; i++) {
            let key_name = 'inputSem' + i;
            semWiseData[key_name].push(user[key_name]);
        }
        let loc = await fetch("https://api.api-ninjas.com/v1/geocoding?city=" + user['city'], 
                                {method: 'GET', headers: {'X-Api-Key': process.env.API_NINJAS_API_KEY}}).
                                then(res => res.json()).
                                then(data => data)     

        if(loc.length > 0) {
            if(!location.hasOwnProperty(JSON.stringify([loc[0].latitude, loc[0].longitude])))
                location[JSON.stringify([loc[0].latitude, loc[0].longitude])] = [];    
            location[JSON.stringify([loc[0].latitude, loc[0].longitude])].push(user['fName'] + " " + user['lName']);
            taken++;
        }
        else {
            console.log("No data for " + user['city']);
        }
        
        if(taken == users.length) {    
            res.render("analysis", {genders: ['Male', 'Female', 'Other'], 
                                    genderDist: Object.values(genderData), 
                                    semWiseData: semWiseData,
                                    locations: location});
        }
    });
});

app.listen(5000, () => {console.log("Server listening on port 5000.")});
