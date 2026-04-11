const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));
var _ = require('underscore');
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl);

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
  return new Promise((resolve, reject) => {
    newBook.save()
      .then((savedBook) => resolve(savedBook))
      .catch((err) => reject(err));
  });
};

function deleteByTitle(title) {
  return new Promise((resolve, reject) => {
    Book.deleteOne({ title })
      .then((deletedBook) => {
        if (deletedBook.deletedCount === 0) {
          resolve('Book not found');
        } else {
          resolve('Book deleted');
        }
      })
      .catch((err) => reject(err));
  });
};

function findAllBooks() {
  return new Promise(async function(resolve, reject) {
    Book.find({})
    .then(function(foundBooks) {
      resolve(foundBooks);
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

function findBooksByStatus(status) {
  return new Promise((resolve, reject) => {
    Book.find({ status })
      .then((foundBooks) => {
        if (status === 'finished') {
          resolve(_.sortBy(foundBooks, 'rating'));
        } else {
          resolve(foundBooks);
        }
      })
      .catch((err) => reject(err));
  });
}

function finishBook(book) {
  return new Promise((resolve, reject) => {
    Book.updateOne({ _id: book._id }, { $set: { rating: book.rating, status: 'finished' } })
      .then(() => resolve('ok'))
      .catch((err) => reject(err));
  });
}

function startBook(book) {
  return new Promise((resolve, reject) => {
    Book.updateOne({ _id: book._id }, { status: 'progress' })
      .then(() => resolve('ok'))
      .catch((err) => reject(err));
  });
}

const User = mongoose.model('User', usersSchema)

function addUser(user) {
  const newUser = new User(user);
  return new Promise((resolve, reject) => {
    newUser.save()
      .then((savedUser) => resolve(savedUser))
      .catch((err) => reject(err));
  });
}

function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    User.find({ username })
      .then((foundUser) => resolve(foundUser))
      .catch((err) => reject(err));
  });
}

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
