const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

let bookSchema = mongoose.Schema({
  image: String,
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: String,
  series: String,
  number: Number,
  description: String,
  owned: Boolean,
  read: Boolean,
  favorite: Boolean
});

let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

let Book = mongoose.model('Book', bookSchema);
let User = mongoose.model('User', userSchema);

module.exports.Book = Book;
module.exports.User = User;
