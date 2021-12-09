const express = require("express");
var cookieParser = require('cookie-parser')
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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};



app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//login page and cookie
app.post("/login", (req,res)=>{
  res.cookie('username', req.body.username);
  res.redirect("/urls")
 });


app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})


 //new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//short url and long url 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
 
  res.render("urls_show", templateVars);
});

//shortURL taking to long url
app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL];  
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);

});
//updating the long url
app.post("/urls/:id", (req, res)=>{
 const key = req.params.id;
 urlDatabase[key] = req.body.longURL;
 res.redirect("/urls");
});

//del
app.post("/urls/:shortURL/delete", (req, res)=>{
  
  const shortURL = req.params.shortURL;
  console.log(shortURL);

  delete urlDatabase[shortURL];
 
  res.redirect("/urls");
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
