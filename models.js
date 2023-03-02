const mongoose = require('mongoose');

let bookSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Series: { type: String, required: true },
  SeriesNumber: { type: Number, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Author: {
    Name: String,
    Bio: String,
  },
  ImagePath: String,
  haveRead: Boolean,
  owned: Boolean,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  Favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

let Book = mongoose.model('Book', bookSchema);
let User = mongoose.model('User', userSchema);

module.exports.Book = Book;
module.exports.User = User;