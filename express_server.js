const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');


//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//DATABASES 
//URL DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

//GET THE USER FROM EMAIL 
function getUserByEmail (userDB, email){
  for (userID in userDB){
    if (userDB[userID].email === email){
      return userDB[userID];
    } 
  } 
  return null; 
}

//HELPER FUNCTIONS 
function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < 7; i++) {
    randomString += characters[(Math.floor(Math.random() * charactersLength))];
  }
  return randomString;
};



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
  const userID = req.cookies['user_id'];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  return res.render("urls_index", templateVars);
});

// RENDER NEW URLS PAGE
app.get("/urls/new", (req, res) => {
  return res.render('urls_new');
})

//RENDER SHOW URLS PAGE
app.get('/urls/:id', (req, res) => {
  const shortID = req.params.id;
  const longURL = urlDatabase[shortID];
  const userID = req.cookies['user_id'];
  const user = users[userID]
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
  const longURL = urlDatabase[shortID];
  return res.redirect(longURL);
})

//RENDER REGISTRATION PAGE
app.get('/register', (req, res) => {
  return res.render('register')
})

app.get('/login',(req,res) => {
  return res.render('login')
} )

//SHORTID AND LONGURL IN DATA BASE 
app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  let shortID = generateRandomString();
  urlDatabase[shortID] = longURL;
  return res.redirect(`/urls/${shortID}`);
})

//DELETE URL ON URLS PAGE
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  return res.redirect('/urls');
})

//UPDATE A RESOURCE
app.post('/urls/:id', (req, res) => {
  const shortID = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortID] = longURL;
  return res.redirect('/urls');
})

//LOGIN ROUTE 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(users, email)
  if(user && user.password === password){
    res.cookie('user_id', user.id);
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
  if (!email || !password) {
    return res.status(400).send('Error registering input email or password')
  }
  const user = getUserByEmail(users, email);
  if(user){
    return res.status(400).send('Error user already exists')
  }
  const userID = generateRandomString();
  const thisUser = {
    id: userID,
    email,
    password
  };
  users[userID] = thisUser;
  res.cookie('user_id', userID);
  res.redirect('/urls');
})



//LISTENING PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});