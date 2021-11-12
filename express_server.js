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

//port will not work without this
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
  console.log("test 6", getUrls);
  console.log("test 7", userId);
  console.log("test 8", urlDatabase);

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
  console.log("test 4", urlDatabase);
  console.log("testing 2", urlDatabase.hasOwnProperty(req.params.shortURL)); //has ownProperty check if they key is in the object, return true or false
  console.log("testing 3", templateVars.longURL);

  return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const userId = req.session.user_id;

  console.log("test 9", req.params.shortURL);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  console.log("test 11", urlDatabase);

  console.log("test 10", longURL);

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

//login page
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  res.render("urls_login", templateVars);
});

//---------------------------------------------------------> Post
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    console.log("error");
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
  console.log("second", urlDatabase);
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
  console.log(urlDatabase);
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  console.log(req.body);
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    return res.send("Empty email and password.");
  }
  const userInfo = lookUpUserByEmail(req.body.email, users);
  console.log("test1", userInfo);
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
    req.session.user_id = userId;
    //link the cookie to the generated ID
    return res.redirect("/login");
  }
});
