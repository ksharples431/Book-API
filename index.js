const bodyParser = require('body-parser');
express = require('express');
morgan = require('morgan');
fs = require('fs');
path = require('path');
uuid = require('uuid');
mongoose = require('mongoose');
Models = require('./models.js');

const Books = Models.Book;
const Users = Models.User;

// Initialize express
const app = express();

// Body parser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Logger middleware
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'log.txt'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

// Serve static files
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1/myBooksDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('strictQuery', false);

// Get all books
app.get('/books', (req, res) => {
  Books.find().then((books) => {
    res.json(books);
  }).catch((err) => {
    console.log(err);
    res.status(500).send('Error: ' + err)
  })
});

// Get book by title
app.get('/books/:Title', (req, res) => {
  Books.findOne({ Title: req.params.Title })
    .then((book) => {
      if (book) {
        res.status(200).json(book);
      } else {
        return res.status(400).send(req.params.Title + " doesn't exist in the database");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get author by name
app.get('/books/authors/:authorName', (req, res) => {
  Books.findOne({ 'Author.Name': req.params.authorName })
    .then((book) => {
      if (book) {
        res.status(200).json(book.Author);
      } else {
        return res
          .status(400)
          .send(req.params.authorName + " doesn't exist in the database");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get genre by name
app.get('/books/genres/:genreName', (req, res) => {
  Books.findOne({ 'Genre.Name': req.params.genreName })
    .then((book) => {
      if (book) {
        res.status(200).json(book.Genre);
      } else {
        return res
          .status(400)
          .send(req.params.genreName + " doesn't exist in the database");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Create new user
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Post new book to favorites
app.post('/users/:Username/books/:BookID', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { Favorites: req.params.BookID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get user by id
// app.get('/users/:uid', (req, res) => {
//   // const title = req.params.title;
//   const { uid } = req.params;
//   const user = users.find((user) => user.uid === uid);
//   if (user) {
//     res.status(200).json(user);
//   } else {
//     res.status(400).send('User not found');
//   }
// });

// Get user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// PUT/Update requests
// Update user's info by username
// app.put('/users/:Username', (req, res) => {
//   Users.findOneAndUpdate(
//     { Username: req.params.Username },
//     {
//       $set: {
//         Username: req.body.Username,
//         Password: req.body.Password,
//         Email: req.body.Email,
//         Birthday: req.body.Birthday,
//       },
//     },
//     { new: true }, // This line makes sure that the updated document is returned
//     (err, updatedUser) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send('Error: ' + err);
//       } else {
//         res.json(updatedUser);
//       }
//     }
//   );
// });

app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  )
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update user's book list
// app.put('/users/:uid/:bookTitle', (req, res) => {
//   const { uid, bookTitle } = req.params;

//   let user = users.find((user) => user.uid == uid);

//   if (user) {
//     user.favoriteBooks.push(bookTitle);
//     res.status(200).send(`${bookTitle} has been added to ${uid}'s array`);
//   } else {
//     res.status(400).send('Favorite book not added');
//   }
// });

// DELETE requests
// Delete user's book from favorites list
app.delete('/users/:uid/:bookTitle', (req, res) => {
  const { uid, bookTitle } = req.params;

  let user = users.find((user) => user.uid == uid);

  if (user) {
    user.favoriteBooks = user.favoriteBooks.filter(
      (title) => title !== bookTitle
    );
    res
      .status(200)
      .send(`${bookTitle} has been deleted from ${uid}'s array`);
  } else {
    res.status(400).send('Favorite book not added');
  }
});

// Delete user by username
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
