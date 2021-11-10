const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); // tells express app to use EJS

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function () {
  return Math.floor((1 + Math.random()) * 0x1000000)
    .toString(16)
    .substring(1);
};

app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//port will not work without this
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars); //render this page and passing variable you can use later
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL.startsWith("http")) {
    res.redirect(longURL);
  } else res.redirect("https://" + longURL);
});

//---------------------------------------------------------> Post
app.post("/urls", (req, res) => {
  const shortRandomURL = generateRandomString();

  urlDatabase[shortRandomURL] = req.body.longURL;
  console.log("test2", urlDatabase[shortRandomURL]);
  console.log("test 3", urlDatabase);
  console.log("test1", req.body); // Log the POST request body to the console
  res.redirect(`/urls/${shortRandomURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log("first", req.params);
  delete urlDatabase[req.params.id];
  console.log("second", urlDatabase);
  res.redirect("/urls");
});

//Post to edit the URL
app.post("/urls/:id/edit", (req, res) => {
  console.log(urlDatabase);
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username); //will create cookie username is the name and req.body.username is the value
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username"); //delete cookie when the person logs out
  res.redirect("/urls");
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/urls/new", (req, res) => {
//   res.render("urls_new");
// });
