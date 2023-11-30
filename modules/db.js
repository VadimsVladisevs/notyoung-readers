const { DB_URL } = require('../constants');
const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));
var _ = require('underscore');

mongoose.connect(DB_URL);

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "Please check your data entry, no username specified!"]
  },
  password: {
    type: String,
    required: [true, "Please check your data entry, no password specified!"]
  }
}, {
  timestamps: true
});

const booksSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: [true, "Book already exist!"],
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
  tag: {
    type: String,
    required: [true, "Please check your data entry, no tag specified!"]
  },
  rating: {
    type: Number,
    minimum: 0,
    maximum: 10
  }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', booksSchema);

function addBook(book) {
  const newBook = new Book(book);
  return new Promise(function(resolve, reject) {
    newBook.save(book, function(err, savedBook) {
      err ? reject(err) : resolve(savedBook);
    });
  });
};

function deleteByTitle(title) {
  return new Promise(function(resolve, reject) {
    Book.deleteOne({title: title}, function(err, deletedBook) {
      err ? reject(err) : deletedBook.deletedCount === 0 ?
        resolve("Book not found") : resolve("Book deleted");
    });
  });
};

function findAllBooks() {
  return new Promise(function(resolve, reject) {
    Book.find(function(err, foundBooks) {
      if (err) {
        reject(err);
      }
      resolve(foundBooks);
    });
  });
};

function findBooksByStatus(status) {
  return new Promise(function(resolve, reject) {
    Book.find({
      status: status
    }, function(err, foundBooks) {
      if (err) {
        reject(err);
      }

      status === 'finished' ? resolve(_.sortBy(foundBooks, 'rating')) : resolve(foundBooks);
    });
  })
};

function finishBook(book) {
  return new Promise(function(resolve, reject) {
    Book.updateOne({_id: book._id}, {$set: {rating: book.rating, status: "finished"}}, function(err) {
      err ? reject(err) : resolve("ok");
      // mongoose.connection.close();
    });
  })
}

function startBook(book) {
  return new Promise(function(resolve, reject) {
    Book.updateOne({_id: book._id}, {status: "progress"}, function(err) {
      err ? reject(err) : resolve("ok");
      // mongoose.connection.close();
    });
  })
}

const User = mongoose.model('User', usersSchema)

function addUser(user) {
  const newUser = new User(user);
  return new Promise(function(resolve, reject) {
    newUser.save(user, function(err, savedUser) {
      err ? reject(err) : resolve(savedUser);
    });
  });
};

function findUserByUsername(username) {
  return new Promise(function(resolve, reject) {
    User.find({
      username: username
    }, function(err, foundUser) {
      if (err) {
        reject(err);
      }

      resolve(foundUser);
    });
  })
};

module.exports = {
  findAllBooks,
  findBooksByStatus,
  finishBook,
  startBook,
  addBook,
  deleteByTitle,
  addUser,
  findUserByUsername,
};
