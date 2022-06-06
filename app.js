const express = require('express');
const https = require('https');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect('mongodb+srv://admin:sta08rtdf@notyoung-reader.be5jr.mongodb.net/readersDB');

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
})

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000!");
});
