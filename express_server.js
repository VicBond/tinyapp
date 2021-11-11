const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

//================================================ HELP FUNCTIONS ================================================

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

//checking for existing email in users object
const existingUser = emailCheck => {
  for (let userID in users) {
    if (users[userID].email === emailCheck) {
      return users[userID].id;
    }
  }
  return false;
};

//checking if password is valid
const passwordMatch = passwordCheck => {
  for (let userID in users) {
    if (users[userID].password === passwordCheck) {
      return true;
    }
  }
  return false;
};

//========================================= END OF HELP FUNCTIONS ================================================

// demo-database to store all URLs as object database
const urlDatabase = {
  "blight": "http://www.lighthouselabs.ca",
  "4goog2": "http://www.google.com",
  "4mail2": "http://www.gmail.com"
};

//object used to store and access the users in the app
const users = {
  "111aaa": {
    id: "111aaa",
    email: "a@a.com",
    password: "424242"
  },
  "222bbb": {
    id: "222bbb",
    email: "b@b.com",
    password: "420000"
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

//endpoint that responds with this new login form template through GET route
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("login", templateVars);
});

//logging through POST route, saves in cookies and redirects to /urls
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = existingUser(userEmail);

  if (!existingUser(userEmail)) {
    res.status(403).send(`An account with ${userEmail} address not exists. Please login with valid email address.`);
  } else if (!passwordMatch(userPassword)) {
    res.status(403).send("Password not correct! Please re-enter a password.");
  } else {
    res.cookie('user_id', userID);
    res.redirect(`/urls`);
  }
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
  
  if (!userEmail || !userPassword) {
    res.status(400).send("Please enter a valid email address or password");
  }

  if (existingUser(userEmail)) {
    res.status(400).send(`An account with email address ${userEmail} already exists. Please login using this email address or reset the password.`);
  }

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
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("register" ,templateVars);
});

// through GET route shows /url_show wich contains data with user long and short
// URLs in EJS template (table structure)
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