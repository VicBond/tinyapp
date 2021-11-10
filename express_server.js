const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


//Generating random string for shortURL (key) in urlDatabase
const generateRandomString = () => {
  let result = "";
  const charLength = 6;
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < charLength; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

// demo-database to store all URLs as object database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//object used to store and access the users in the app
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//shows urls_index at /urls with data of urls and user cookies from object_database
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

//logging through POST route, saves in cookies and redirects to /urls
app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.user_id);
  res.redirect(`/urls`);
});

//logging out through POST route and removes cookies of user
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

//Registration Handler by POST route
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const randomUserID = generateRandomString();
  
  users[randomUserID] = {
    id: randomUserID,
    email: userEmail,
    password: userPassword
  };
  
  res.cookie('user_id', randomUserID);
  res.redirect(`/urls`);
});

//through GET route at /urls_new creates a new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new" ,templateVars);
});

//through GET route register a new user in registration form  (new template)
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render("register" ,templateVars);
});

// through GET route shows /url_show wich contains data with user long and short     // URLs in EJS template (table structure)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
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