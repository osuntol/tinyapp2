// DEPENDENCIES
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const {
  getUserByEmail,
  urlsForUser,
  generateRandomString } = require('./helper.js');

const { urlDatabase, users } = require('./database.js')



//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey'],
  maxAge: 24 * 60 * 60 * 1000
}))


//  GET ROUTES 

//HOME PAGE
app.get("/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.redirect('/login');
  } else {
        return res.redirect('/urls')
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// RENDER THE URLS PAGE
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user) {
    return res.send('Login or Register first to access this page')
  }
  const templateVars = {
    urls: urlsForUser(urlDatabase, user_id),
    user
  };
    return res.render("urls_index", templateVars);
});

// RENDER NEW URLS PAGE
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
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
  const user_id = req.session.user_id;
  const longURL = urlDatabase[shortID].longURL;
  const user = users[user_id]
  if (!user) {
    return res.redirect('/login');
  }
  if (!shortID) {
    res.status(400).send('id does not exist');
    }
  const templateVars = {
    id: shortID,
    longURL,
    user
  };
  if (urlDatabase[shortID].userID == user_id) {
    return res.render('urls_shows', templateVars)
  } else {
    res.send('Error can only be updated if they belong to user').status(403);
  }
})

//REDIRECT TO LONG URL AFTER CLICKING SHORT URL 
app.get('/u/:id', (req, res) => {
  const shortID = req.params.id;
  if (shortID in urlDatabase) {
    const longURL = urlDatabase[shortID].longURL;
    return res.redirect(longURL);
  }
  res.send('Error short ID does not exist')
})

//RENDER REGISTRATION PAGE
app.get('/register', (req, res) => {

  const user_id = req.session.user_id;
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
  const user_id = req.session.user_id;
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
  const user_id = req.session.user_id;
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
//UPDATE A RESOURCE
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
  const longURL = req.body.longURL;

  if (!id) {
  res.status(400).send('id does not exist');
  }
  if (!user) {
    res.status(400).send('user is not logged in');
  }
  if (urlDatabase[id].userID == user) {
    urlDatabase[id].longURL = longURL;
    return res.redirect("/urls");
  } else {
    res.send('Error can only be updated if they belong to user').status(403);
  }
})

//DELETE URL ON URLS PAGE
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
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


//LOGIN ROUTE 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = getUserByEmail(users, email);
  if (user && bcrypt.compareSync(password, hashedPassword)) {
    req.session['user_id'] = user.id;
  }
  if (!email || !hashedPassword) {
    return res.status(400).send('Error logging in input email or password')
  }
  return res.redirect('/urls');
})

//LOGOUT ROUTE 
app.post('/logout', (req, res) => {
  req.session['user_id'] = null;
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
   req.session.user_id = userID;
  res.redirect('/urls');
})



//LISTENING PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});