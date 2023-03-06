const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');


//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// RENDER NEW URLS PAGE
app.get("/urls/new", (req, res) => {
  res.render('urls_new');
})


//RENDER SHOW URLS PAGE
app.get('/urls/:id', (req, res) => {
  const shortID = req.params.id;
  const longURL = urlDatabase[shortID];
  const templateVars = {
    id: shortID,
    longURL
  };

  res.render('urls_shows', templateVars)
})

//REDIRECT TO LONG URL AFTER CLICKING SHORT URL 
app.get('/u/:id', (req, res) => {
  const shortID = req.params.id;
  const longURL = urlDatabase[shortID];
  return res.redirect(longURL);
})

//CREATING THE NEW SHORTID AND LONGURL TO PUT INTO DATA BASE 
app.post('/urls', (req, res) => {
  let longURL = req.body.longURL;
  let shortID = generateRandomString();
  urlDatabase[shortID] = longURL;

  res.redirect(`/urls/${shortID}`);
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
urlDatabase[shortID] = longURL
console.log('req.params', req.params)
console.log('req.body', req.body)
res.redirect ('/urls')
})

//LOGIN ROUTE 
app.post('/login', (req,res) => {
  const username = req.body.username;
  res.cookie('username', username)
  res.redirect('/urls')
})

//LISTENING PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});