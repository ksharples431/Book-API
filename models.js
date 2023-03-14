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
  // availability: Array,
  read: Boolean,
  favorite: Boolean
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
