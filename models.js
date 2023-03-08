const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

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

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Book = mongoose.model('Book', bookSchema);
let User = mongoose.model('User', userSchema);

module.exports.Book = Book;
module.exports.User = User;
