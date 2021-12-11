const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const generateRandomString = function() {
  let str = Math.random().toString(36).substr(2, 6);
  return str;
}



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


module.exports={findUserByEmail, generateRandomString, urlsForUser};