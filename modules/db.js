const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));

const user = process.env.DB_USER;
const password = process.env.DB_PW;

mongoose.connect('mongodb+srv://' + user + ':' + password + '@notyoung-reader.be5jr.mongodb.net/readersDB');

const booksSchema = {
  title: {
    type: String,
    required: [true, "Please check your data entry, no title specified!"]
  },
  author: {
    type: String,
    required: [true, "Please check your data entry, no author specified!"]
  },
  image: {
    type: String,
    required: [true, "Please check your data entry, no image specified!"]
  },
  status: {
    type: String,
    required: [true, "Please check your data entry, no status specified!"]
  },
  wiki: String,
  rating: {
    type: Number,
    minimum: 0,
    maximum: 10
  }
};

const Book = mongoose.model('Book', booksSchema);

function findAllBooks() {
  return new Promise(function(resolve, reject) {
    Book.find(function(err, foundBooks) {
      if (err) {
        reject(err);
      }
      resolve(foundBooks);
    });
  });
}

function findBooksByStatus(status) {
  return new Promise(function(resolve, reject) {
<<<<<<< HEAD
    Book.find({
      status: status
    }, function(err, foundBooks) {
=======
    Book.find({status: status}, function(err, foundBooks) {
>>>>>>> 72bb417ad763a0638fcdaca81a3f2542b6021155
      if (err) {
        reject(err);
      }
      resolve(foundBooks);
<<<<<<< HEAD
    });
  })
};
=======
  });
})};
>>>>>>> 72bb417ad763a0638fcdaca81a3f2542b6021155

module.exports = {
  findAllBooks,
  findBooksByStatus
};
