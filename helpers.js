//--------external file for functions used in express_server.js-------//

//takes in the user object and checks for user email
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//returns a random string for short url and id of the user
const generateRandomString = function () {
  let str = Math.random().toString(36).substr(2, 6);
  return str;
};

//takes in the id and object to return urls created by the specific user
const urlsForUser = (id, urlDatabase) => {
  const urls = [];
  for (const [key, value] of Object.entries(urlDatabase)) {
    if (value.userID === id) {
      value.shortURL = key;
      urls.push(value);
    }
  }
  return urls;
};

//exporting all to express_server.js
module.exports = { findUserByEmail, generateRandomString, urlsForUser };
