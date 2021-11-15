/* eslint-disable camelcase */
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { generateRandomString, getUserByEmail, userURL } = require("./helpers");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'user_id',
  keys: ['introduction-to-security'],
}));

//URL DB OBJECT
const urlDatabase = {};

//USERS DB OBJECT
const users = {};


//ROOT
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

//USER'S URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: userURL(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    res.status(401).send(`<h2>You must be looged in. Please <a href="/login">login</a> to an account or <a href="/register">register</a> a new account.</h2>`);
  }
  res.render("urls_index", templateVars);
});

//LOGIN GET
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {
    user: users[id],
    email: req.body.email,
    password: req.body.password
  };
  if (id) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});

//LOGIN POST
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = getUserByEmail(userEmail, users);
  if (!user || !bcrypt.compareSync(userPassword, user.password)) {
    res.status(403).send(`<h2>Invalid cridentials. Please <a href="/login">login</a> with valid email address and password.</h2>`);
  }
  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

//LOGOUT POST
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

//REGISTER POST
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const randomUserID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(userPassword, salt);
  
  if (!userEmail || !userPassword) {
    res.status(400).send(`<h2>Enter a valid email address and password. Please <a href="/register">try again</a>!</h2>`);
  }

  if (getUserByEmail(userEmail, users)) {
    res.status(400).send(`<h2>An account with email address ${userEmail} already exists. Please try to <a href="/login">login</a> using this email address</h2>`);
  }

  users[randomUserID] = {
    id: randomUserID,
    email: userEmail,
    password: hashedPassword
  };

  // eslint-disable-next-line camelcase
  req.session.user_id = randomUserID;
  res.redirect(`/urls`);
});

//REGISTER GET
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    email: req.body.email,
    password: req.body.password
  };
  if  (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("register" ,templateVars);
});

///CREATE URL GET
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  req.session.user_id ? res.render("urls_new" ,templateVars) : res.redirect("/login");
});

//URLs SHORT GET
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userURLs: urlDatabase[req.params.shortURL].userID
  };
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send(`<h2>This URL does not exist.<h1>404</h1> Please <a href="/urls">try another</a>one!</h2>`);
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(400).send(`<h2>This URL does not belongs to you.<h1>400</h1> Please <a href="/urls/new">add it </a>to you list!</h2>`);
  }
  res.render("urls_show", templateVars);
});

//REDIRECT TO URL'S  WEBSITE
app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    res.status(404).send(`<h2>This URL does not exist.<h1>404</h1> Please <a href="/urls">try another</a>one!</h2>`);
  }
  res.redirect(shortURL.longURL);
});


// POST CREATE NEW URL
app.post("/urls", (req, res) => {
  const newURL = req.body.longURL;
  const randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = {
    longURL: newURL,
    userID: req.session.user_id,
  };
  if (!req.session.user_id) {
    res.status(401).send(`<h2>You must be looged in. Please <a href="/login">login</a> to an account or <a href="/register">register</a> a new account.</h2>`);
  }
  res.redirect(`/urls/${randomShortURL}`);
});


// POST EDIT URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(403).send(`<h2>You have no permission to access this. Please <a href="/login">login</a> or <a href="/register">register</a> a new account.</h2>`);
  }
  urlDatabase[shortURL].longURL = newURL;
  res.redirect(`/urls`);
});

// POST DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(403).send(`<h2>You have no permission to access this. Please <a href="/login">login</a> or <a href="/register">register</a> a new account.</h2>`);
  }
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});


//listens on port defined in variable PORT
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});