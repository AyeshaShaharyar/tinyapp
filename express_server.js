const express = require("express");
var cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

function generateRandomString() {
  let str = Math.random().toString(36).substr(2, 6);
  return str;
}

const users = {
  123: {
    id: "123",
    email: "joe@hotmail.com",
    password: "abcd",
  },
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  users[id] = { id: id, email: email, password: password };

  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  console.log("user", user);

  if (user) {
    return res.status(400).send("a user with that email already exists");
  }

  res.cookie("user_id", id);
  console.log(users[id]);
  res.redirect("/urls");
});

const urlDatabase = {
  'b6UTxQ': {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  "i3BoGr": {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};
//urldatabse[shorturl]=> object => keys of longurl and user_id
//urldabase[shorturl].longurl
//urldabase[shorturl].user_id


app.get("/urls", (req, res) => {
 const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]}
console.log("!!!" , urlDatabase);
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  res.render("login");
});
//login page and cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserByEmail(email);

  if (!user) {
    return res.status(403).send("a user with that email doesn't exists");
  } else if (user.password !== password) {
    return res.status(403).send("your password doesn not match");
  }

  res.cookie("user_id", user.id);

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
});

//new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],

  };
  if (!templateVars.user) res.status(403).send("Not authorize for this action");
  res.render("urls_new", templateVars);
});

//short url and long url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies['user_id']],
  };
  // console.log("issue of longurl", templateVars.urlDatabase[req.params.shortURL].longURL);
  res.render("urls_show", templateVars);
});

//shortURL taking to long url
app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL].longURL;
 
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = generateRandomString();
  const longUrl = req.body.longURL;
  urlDatabase[shortURL] = {
    longUrl,
    userId
  };
  console.log("----------", urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`);
});

//updating the long url
app.post("/urls/:id", (req, res) => {
  const key = req.params.id;
  urlDatabase[key].longURL = req.body.longURL;
  if(!key){
    return ("This url does not exist")
  }
  res.redirect("/urls");
});

//del
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  // console.log(shortURL);

  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}!`);
});
