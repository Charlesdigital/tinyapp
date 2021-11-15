// IMPORTING MODULES
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  lookUpUserByEmail,
  urlsForUser,
  urlDatabase,
} = require("./helpers");

// SET/CONFIGURE SEVER AND MIDDLEWARE (all the setting for passing requests)
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); // tells express app to use EJS
app.use(express.urlencoded({ extended: true }));// allows the sever pass any type data, that is not only text
app.use(express.json()); // allows your server pass json documents/data
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


// ROUTES/ENDPOINTS
app.get('/', (req, res) => {
  const {userId} = req.session;
  if (!userId) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const {user_id} = req.session;
  if (!user_id) {
    return res.render("urls_error", {
      message: "Please Register or Login",
      user: null,
    });
  }
  const getUrls = urlsForUser(user_id, urlDatabase);
  const templateVars = { urls: getUrls, user: users[user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const {user_id} = req.session;
  const getUrls = urlsForUser(user_id, urlDatabase);

  if (!user_id) {
    return res.render("urls_error", {
      message: "Please Register or Login",
      user: null,
    });
  }
  const templateVars = { urls: getUrls, user: users[user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const {user_id} = req.session;
  const shortURL = req.params.shortURL;
  if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    return res.render("urls_error", {
      message: "Error, Invalid Short URL",
      user: user_id,
    });
  }
  if (user_id !== urlDatabase[shortURL]["userID"]) {
    return res.render("urls_error", {
      message: "Error, No access",
      user: user_id,
    });
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[user_id],
  };
  return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const {shortURL} = req.params;

  const validShortUrl = urlDatabase.hasOwnProperty(shortURL);
  if (!validShortUrl) {
    const templateVars = {
      message: "Error, Invalid Short URL",
      user: null,
    };
    return res.render("urls_error", templateVars);
  }

  const longURL = urlDatabase[shortURL].longURL;
  if (longURL.includes("http")) {
    res.redirect(longURL);
  }

  return res.redirect("https://" + longURL);
});

app.get("/register", (req, res) => {
  const {user_id} = req.session;
  if (user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const {user_id} = req.session;
  const templateVars = { user: users[user_id] };
  res.render("urls_login", templateVars);
});

//---------------------------------------------------------> Post
app.post("/urls", (req, res) => {
  const {user_id} = req.session;
  if (!user_id) {
    return res.redirect("/login");
  }
  const shortRandomURL = generateRandomString();
  urlDatabase[shortRandomURL] = {
    longURL: req.body.longURL,
    userID: user_id,
  };
  res.redirect("/urls/");
});

app.post("/urls/:id/delete", (req, res) => {
  const {user_id} = req.session;
  if (!user_id) {
    return res.sendStatus(401);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Post to edit the URL
app.post("/urls/:id/edit", (req, res) => {
  const {user_id} = req.session;
  if (!user_id) {
    return res.sendStatus(401);
  }

  const urlObject = urlDatabase[req.params.id];
  if (!urlObject) {
    return res.sendStatus(404);
  }

  const {longURL} = req.body;
  urlObject.longURL = longURL;
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
  const {user_id} = req.session;
  if (user_id) {
    return res.status(400).send("User already logged in");
  }

  const {email, password} = req.body;
  if (!email || !password) {
    return res.status(400).send("Empty email or password.");
  }

  const emailExists = lookUpUserByEmail(email, users)
  if (emailExists) {
    return res.status(400).send("Email already registered.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();  //Generate Id

  users[userId] = { id: userId, email: email, password: hashedPassword };

  req.session.user_id = userId;
  return res.redirect("/urls");

});

//LISTENER - ALLOWING INCOMING REQUESTS
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//4 steps
//1. import requirements
//2. set and configure sever and middlewares
//3. set the different end points
//4. invoke the listener to allow incoming requests