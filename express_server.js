const express = require("express");
var cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { findUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const bodyParser = require("body-parser");
const app = express();

const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: [
      "I like potatoes and gravy and cheese",
      "I prefer filtered coffee over espresso, sometimes",
    ],
  })
);

app.set("view engine", "ejs");

// ---------------- Databases ---------------- //
const users = {
  123: {
    id: "123",
    email: "joe@hotmail.com",
    password: "$2a$10$NX5z5whsZmKEfQriLnuP5uVFL2oTA0isUYXYUkBnhytFRVOpkf9vm",
  },


};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "123",
  },
};

const salt = bcrypt.genSaltSync(10);

// ---------------- Register (Get and Post) ---------------- //

app.get("/register", (req, res) => {
  res.render("register");
});


app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, salt);
  const user = findUserByEmail(email, users);
  users[id] = { id: id, email: email, password: password };

  if (!email || !password) {
    return res
      .status(400)
      .send(
        "Missing Email or Password. Please <a href='/register'>try again.</a>"
      );
  }

  if (user) {
    return res
      .status(400)
      .send(
        "A user with that email already exists. Please <a href='/register'>try again.</a>"
      );
  }

  req.session.user_id = id;
  
  res.redirect("/urls");
});

// ---------------- Login (Get and Post) ---------------- //

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  // const password = bcrypt.hashSync(req.body.password, salt);;

  const user = findUserByEmail(email, users);
  
  const passwordMatch = bcrypt.compareSync(req.body.password, user.password);

  if (!user) {
    return res
      .status(403)
      .send("Wrong Email. Please <a href='/login'>try again.</a>");
  }
  if (!passwordMatch) {
    return res
      .status(403)
      .send("Wrong Password. Please <a href='/login'>try again.</a>");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// ---------------- Urls (Get and Post) ---------------- //

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please <a href='/login'>login</a> first");
  }

  const user = users[req.session.user_id];
  req.session.user_id = user.id;
  const urls = urlsForUser(user.id, urlDatabase);
  const templateVars = {
    urls,
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID,
  };
 
  res.redirect(`/urls`);
});

// ---------------- Create New Url ---------------- //
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!templateVars.user) {
    res.status(403).send("Not authorize for this action. Please <a href='/login'>login</a> first.");
    
  }

  res.render("urls_new", templateVars);
});

// ---------------- Short and Long URL ---------------- //
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    res.send("Not accessible. Please <a href='/login'>login</a> first.");
    res.redirect("/login");
  }
  const user = users[req.session.user_id];

  if (!urlDatabase[shortURL]) {
    res.send("Not authorized for this action");
  } else if (urlDatabase[shortURL].userID !== user.id) {
    res.send("Not authorized for this action");
  }
  if (!shortURL) {
    return "This url does not exist";
  }

  const templateVars = {
    shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };

  res.render("urls_show", templateVars);
});

// ---------------- Short url taking to long url ---------------- //
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  const user = users[req.session.user_id];

  if (!urlDatabase[shortURL]) {
    res.send("Not authorized for this action");
  } else if (urlDatabase[shortURL].userID !== user.id) {
    res.send("Not authorized for this action");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});


app.get("/u/:id", (req, res) => {
  const key = req.params.id;
  const user = users[req.session.user_id];
  if (!urlDatabase[key]) {
    res.send("Not authorized for this action");
  } else if (urlDatabase[key].userID !== user.id) {
    res.send("Not authorized for this action");
  }
});

//----------- Updating the long url -----------//
app.post("/urls/:id", (req, res) => {
  const key = req.params.id;
  if (!req.session.user_id) {
    res.send("Not accessible. Please <a href='/login'>login</a> first.");
    res.redirect("/login");
  }
  const user = users[req.session.user_id];

  if (!urlDatabase[key]) {
    res.send("Not authorized for this action");
  } else if (urlDatabase[key].userID !== user.id) {
    res.send("Not authorized for this action");
  }
  if (!key) {
    return "This url does not exist";
  }
  urlDatabase[key].longURL = req.body.longURL;
  res.redirect("/urls");
});

// ---------------- Delete URL ---------------- //
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

// ---------------- Logout ----------------- //
app.post("/logout", (req, res) => {
  delete req.session.user_id;

  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}!`);
});
