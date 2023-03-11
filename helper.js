//GET USER BU EMAIL
function getUserByEmail(userDB, email) {
  for (const userID in userDB) {
    if (userDB[userID].email === email) {
      return userDB[userID];
    }
  }
  return null;
}

//GET URLS ACCORDING TO USER
function urlsForUser(urlDatabase, id) {
  let userURLs = {}
  for (const shortID in urlDatabase) {
    if (urlDatabase[shortID].userID === id) {
      userURLs[shortID] = urlDatabase[shortID]
    }
  }
  return userURLs
}

//GENERATE RANDOM STRING
function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < 7; i++) {
    randomString += characters[(Math.floor(Math.random() * charactersLength))];
  }
  return randomString;
};


module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
}