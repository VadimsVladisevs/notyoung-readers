const {
  findAllBooks,
  findBooksByStatus
} = require('./modules/db.js');

const fs = require('node:fs/promises');

const express = require('express');
const https = require('https');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/books', function(req, res) {
  const status = req.query.status;

  if (status) {
    findBooksByStatus(status).then(function(foundBooks) {
      res.send(foundBooks);
    }).catch(function(err) {
      res.send(err);
    });
  } else {
    findAllBooks().then(function(foundBooks) {
      res.send(foundBooks);
    }).catch(function(err) {
      res.send(err);
    });
  }
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000!");
});
