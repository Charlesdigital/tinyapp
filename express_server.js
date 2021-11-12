const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");

app.set("view engine", "ejs"); // tells express app to use EJS
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  lookUpUserByEmail,
  urlsForUser,
  urlDatabase,
} = require("./helpers");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({ name: "session", keys: ["key1", "key2"] }));

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.render("urls_error", {
      message: "Please Register or Login",
      user: null,
    });
  }
  const getUrls = urlsForUser(userId, urlDatabase);
  const templateVars = { urls: getUrls, user: users[userId] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const getUrls = urlsForUser(userId, urlDatabase);

  if (!userId) {
    return res.render("urls_error", {
      message: "Please Register or Login",
      user: null,
    });
  }
  const templateVars = { urls: getUrls, user: users[userId] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    return res.render("urls_error", {
      message: "Error, Invalid Short URL",
      user: userId,
    });
  }
  if (userId !== urlDatabase[shortURL]["userID"]) {
    return res.render("urls_error", {
      message: "Error, No access",
      user: userId,
    });
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[userId],
  };
  return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const userId = req.session.user_id;

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];

  if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    return res.render("urls_error", {
      message: "Error, Invalid Short URL",
      user: userId,
    });
  }
  if (longURL.includes("http")) {
    res.redirect(longURL);
  } else res.redirect("https://" + longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  res.render("urls_login", templateVars);
});

//---------------------------------------------------------> Post
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/login");
  }
  const shortRandomURL = generateRandomString();
  urlDatabase[shortRandomURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect("/urls/");
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.sendStatus(401);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Post to edit the URL
app.post("/urls/:id/edit", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.sendStatus(401);
  }
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: userId,
  };
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    return res.send("Empty email and password.");
  }
  const userInfo = lookUpUserByEmail(req.body.email, users);
  if (!(userInfo && bcrypt.compareSync(req.body.password, userInfo.password))) {
    res.statusCode = 403;
    return res.send("Wrong password");
  }
  if (!userInfo) {
    res.statusCode = 403;
    return res.send("User not found");
  }
  req.session.user_id = userInfo.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null; //delete cookie when the person logs out
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const userId = generateRandomString();
  if (!email || !password) {
    res.statusCode = 400;
    res.send("Empty email and password.");
  } else if (lookUpUserByEmail(email, users)) {
    res.statusCode = 400;
    res.send("Username already created.");
  } else {
    users[userId] = { id: userId, email: email, password: password };
    //Generate Id
    req.session.user_id = userId;
    return res.redirect("/login");
  }
});
