require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./modules/db.js');

const fs = require('node:fs/promises');

const express = require('express');
const https = require('https');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');

app.use(express.static("public"));

// app.use(bodyParser.urlencoded({
//   extended: true
// }));
app.use(bodyParser.json());

app.get('/books', function(req, res) {
  const status = req.query.status;

  if (status) {
    db.findBooksByStatus(status).then(function(foundBooks) {
      res.send(foundBooks);
    }).catch(function(err) {
      res.send(err);
    });
  } else {
    db.findAllBooks().then(function(foundBooks) {
      res.send(foundBooks);
    }).catch(function(err) {
      res.send(err);
    });
  }
});

app.post('/', function(req, res) {
  res.redirect('/');
});

app.post('/finish', function(req, res) {
  const book = req.body;

  db.finishBook(book).then(function(result) {
    res.send({result: result});
  }).catch(function(err) {
    res.send(err);
  });
});

app.post('/start', function(req, res) {
  const book = req.body;
  db.startBook(book).then(function(result) {
    res.send({result: result});
    // res.redirect('/');
  }).catch(function(err) {
    res.send(err);
  });
});

app.post('/check', function(req, res) {
  var saltRounds = 10;
  var pw = req.body.pw;
  var myPw = "$2b$10$kVdazpXUBvuWjCtTn3dePeSrbkDXfX9PUT77aYHISvnJQgObp9rpG";
  var result = bcrypt.compareSync(pw, myPw);
  res.send({result: result});
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000!");
});
