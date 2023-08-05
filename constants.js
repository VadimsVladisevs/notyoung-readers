const user = process.env.DB_USER;
const password = process.env.DB_PW;

// const DB_URL = 'mongodb://localhost:27017/readersDB';
const DB_URL = `mongodb+srv://${user}:${password}@notyoung-reader.be5jr.mongodb.net/readersDB`;

exports.DB_URL = DB_URL;