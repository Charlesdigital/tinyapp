const { assert } = require("chai");

const { lookUpUserByEmail } = require("../helpers.js");

const testUsers = {
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

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("lookUpUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = lookUpUserByEmail("user2@example.com", users);
    const expectedOutput = "user2RandomID";
    assert.strictEqual(user.id, expectedOutput);
  });
  it("return an undefined user object if not in the database", () => {
    const user = lookUpUserByEmail("random@gmail.com", users);

    assert.strictEqual(user, undefined);
  });
  //cant do a key of undefined thats why user.id didn't work in the second test
  //     it("ensure we get back two elements", () => {

  //   });
});
