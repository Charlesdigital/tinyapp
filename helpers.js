//Generates a random alphanumeric ID
const generateRandomString = function () {
  return Math.floor((1 + Math.random()) * 0x1000000)
    .toString(16)
    .substring(1);
};

//return the user vs just the email so access to the key value pairs like password
const lookUpUserByEmail = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};

// Gets a list of longURLs with same id
const urlsForUser = function (id, urlDatabase) {
  const listOfUrls = {};
  for (const shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL].userID) {
      listOfUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  console.log(listOfUrls);
  return listOfUrls;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

module.exports = {
  generateRandomString,
  lookUpUserByEmail,
  urlsForUser,
  urlDatabase,
};
