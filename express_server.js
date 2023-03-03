const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }))

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
  res.json(urlDatabase)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render('urls_index', templateVars)
})

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new');
})

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]
  const templateVars = {
    id: shortURL,
    longURL
  }
  console.log('longURL',longURL)
  res.render('urls_shows', templateVars)
})

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('OK')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});