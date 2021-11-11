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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const lookUpUserByEmail = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

//port will not work without this
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { urls: urlDatabase, user: users[userId] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"];
  if (!userId) {
    return res.render("urls_error", {
      message: "Please Register or Login",
      user: null,
    });
  }
  const templateVars = { user: users[userId] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL.startsWith("http")) {
    res.redirect(longURL);
  } else res.redirect("https://" + longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("urls_register", templateVars);
});

//login page
app.get("/login", (req, res) => {
  // const userId = req.session.user_id;
  const templateVars = { user: null };
  res.render("urls_login", templateVars);
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
  console.log(req.body);
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    return res.send("Empty email and password.");
  }
  const userInfo = lookUpUserByEmail(req.body.email, users);
  console.log("test1", userInfo);
  if (userInfo && userInfo.password !== req.body.password) {
    res.statusCode = 403;
    return res.send("Wrong password");
  }
  if (!userInfo) {
    res.statusCode = 403;
    return res.send("User not found");
  }
  res.cookie("userId", userInfo.id); //will create cookie username is the name and req.body.username is the value
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId"); //delete cookie when the person logs out
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();
  if (!email || !password) {
    res.statusCode = 400;
    res.send("Empty email and password.");
  } else if (lookUpUserByEmail(email, users)) {
    res.statusCode = 400;
    res.send("Username already created.");
  } else {
    users[userId] = { id: userId, email: email, password: password };
    res.cookie("user_id", userId);
    //link the cookie to the generated ID
    return res.redirect("/urls");
  }
});
