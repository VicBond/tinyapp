const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


//Generating random string for shortURL (key) in urlDatabase
function generateRandomString() {
  let result = "";
  const charLength = 6;
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < charLength; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// demo-database to store all URLs as object database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//shows urls_index at /urls with data of urls  and username cookies from object_database
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

//logging through POST route, saves in cookies and redirects to /urls
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

//logging out through POST route and removes cookies of user
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

//through GET route at /urls_new creates a new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new" ,templateVars);
});

// through GET route shows /url_show wich contains data with username long and short     // URLs in EJS template (table structure)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

//request through GET route redirects to actual URL (longURL)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//at root prints Hello!
app.get("/", (req, res) => {
  res.send("Hello!");
});

//GET route shows an JSON object og urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// create a new shortURL and redirect to this URL
app.post("/urls", (req, res) => {
  const newURL = req.body.longURL;
  const randomShortURL = generateRandomString();
  
  urlDatabase[randomShortURL] = newURL;
  
  res.redirect(`/urls/${randomShortURL}`);

});

//Prints Hello World at /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// edit an existing URL through POST route
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;

  urlDatabase[shortURL] = newURL;

  res.redirect(`/urls/${shortURL}`);
});

// deleting an existing URL through POST route
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

//listens on port defined in variable PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});