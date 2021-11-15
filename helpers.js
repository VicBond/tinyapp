//Generating random string for shortURL (key) in urlDatabase
const generateRandomString = () => {
  let result = "";
  const charLength = 6;
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (result.length < charLength) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

//checking for existing email in users object
const getUserByEmail = (emailCheck, users) => {
  for (let userID in users) {
    if (users[userID].email === emailCheck) {
      return users[userID];//return users[userID].id;
    }
  }
  return false;
};

//shows only urls that userID created or updated
const userURL = (userID, urlDatabase) => {
  const urls = {};
  for (let shortURL in urlDatabase)  {
    if (urlDatabase[shortURL].userID === userID) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

module.exports = { generateRandomString, getUserByEmail, userURL };
