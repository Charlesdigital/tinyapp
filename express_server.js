const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); // tells express app to use EJS

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }; //.longURL
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    if (longURL.startsWith("http")) {
        res.redirect(longURL);
      } else res.redirect("https://" + longURL);
  });

//---------------------------------------------------------> Post
app.post("/urls", (req, res) => {
const shortRandomURL = generateRandomString();

urlDatabase[shortRandomURL] = req.body.longURL
console.log("test2", urlDatabase[shortRandomURL])
console.log("tset 3",urlDatabase)
  console.log("test1", req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortRandomURL}`);
});