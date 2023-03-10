const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//DATABASES 
//URL DATABASE
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//USER DATABASE
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "asdf",
  },
};



//HELPER FUNCTIONS 
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

//GET THE USER FROM EMAIL 
function getUserByEmail(userDB, email) {
  for (const userID in userDB) {
    if (userDB[userID].email === email) {
      return userDB[userID];
    }
  }
  return null;
}

function urlsForUser(urlDatabase, id) {
  let userURLs = {}
  for (const shortID in urlDatabase) {
    if (urlDatabase[shortID].userID === id) {
      userURLs[shortID] = urlDatabase[shortID]
    }
  }
  return userURLs

}

//  GET ROUTES 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// RENDER THE URLS PAGE
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  if (!user) {
    res.send('Login or Register first to access this page')
  }
  const templateVars = {
    urls: urlsForUser(urlDatabase, user_id),
    user
  };
  return res.render("urls_index", templateVars);
});

// RENDER NEW URLS PAGE
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = {
    user
  };
  return res.render('urls_new', templateVars);
})

//RENDER SHOW URLS PAGE
app.get('/urls/:id', (req, res) => {
  const shortID = req.params.id;
  const user_id = req.cookies['user_id'];
  const longURL = urlDatabase[shortID].longURL;
  const user = users[user_id]
  const templateVars = {
    id: shortID,
    longURL,
    user
  };

  return res.render('urls_shows', templateVars)
})

//REDIRECT TO LONG URL AFTER CLICKING SHORT URL 
app.get('/u/:id', (req, res) => {
  const shortID = req.params.id;
  for (let shortID in users) {
    if (!shortID) {
      res.send('Error short ID does not exist')
    }
  }
  const longURL = urlDatabase[shortID].longURL;
  return res.redirect(longURL);
})

//RENDER REGISTRATION PAGE
app.get('/register', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  if (user) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user
  };
  return res.render('register', templateVars)
})

//LOGIN GET ROUTE
app.get('/login', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  if (user) {
    return res.redirect('/urls');
  };
  const templateVars = {
    user
  };
  return res.render('login', templateVars)
})


//POST ROUTES 

//SHORTID AND LONGURL IN DATA BASE 
app.post('/urls', (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  if (!user) {
    res.send('Not logged, in cannot create short URL');
  }
  let longURL = req.body.longURL;
  let shortID = generateRandomString();
  urlDatabase[shortID] = {
    longURL,
    userID: user_id
  };
  return res.redirect(`/urls/${shortID}`);
})

//DELETE URL ON URLS PAGE
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const user = req.cookies['user_id'];
  if (!id) {
    res.status(400).send('id does not exist');
  }
  if (!user) {
    res.status(400).send('user is not logged in');
  }
  if (urlDatabase[id].userID === user) {
    delete urlDatabase[id];
  } else {
    res.send('Error can only be deleted if they belong to user').status(403);
  }
  res.redirect("/urls");
})

//UPDATE A RESOURCE
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const user = req.cookies['user_id'];
  const shortID = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortID].longURL = longURL;
  if (!id) {
    res.status(400).send('id does not exist');
  }
  if (!user) {
    res.status(400).send('user is not logged in');
  }
  if (urlDatabase[id].userID === user) {
    delete urlDatabase[id];
  } else {
    res.send('Error can only be deleted if they belong to user').status(403);
  }
  return res.redirect("/urls");
})

//LOGIN ROUTE 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(users, email);
  if (user && bcrypt.compareSync(password, hashedPassword)) {
    res.cookie('user_id', user.id);
  }
  if (!email || !hashedPassword) {
    return res.status(400).send('Error logging in input email or password')
  }
  return res.redirect('/urls');
})

//LOGOUT ROUTE 
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  return res.redirect('/login');
})

//REGISRATION ROUTE
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !hashedPassword) {
    return res.status(400).send('Error registering input email or password')
  }
  const user = getUserByEmail(users, email);
  if (user) {
    return res.status(400).send('Error user already exists')
  }
  const userID = generateRandomString();
  const thisUser = {
    id: userID,
    email,
    hashedPassword
  };
  users[userID] = thisUser;
  res.cookie('user_id', userID);
  res.redirect('/urls');
})



//LISTENING PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});