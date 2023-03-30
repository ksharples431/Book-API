const bodyParser = require('body-parser'),
  fs = require('fs'),
  path = require('path'),
  express = require('express'),
  mongoose = require('mongoose'),
  morgan = require('morgan'),
  cors = require('cors'),
  dotenv = require('dotenv'),
  Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const Books = Models.Book;
const Users = Models.User;

// Initialize express
const app = express();

// Enviroment variables
dotenv.config();

// Body parser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Cors middleware
// let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         let message =
//           `The CORS policy for this application doesn’t allow access from origin ` +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

// Allow all origins
app.use(cors());

// Auth
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// Logger middleware
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'log.txt'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// Serve static files
app.use(express.static('public'));

// Database
// mongoose.connect('mongodb://127.0.0.1/myBooksDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('strictQuery', false);

// API endpoints
// Get all books

app.get(
  '/books',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Books.find()
      .then((books) => {
        res.json(books);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// app.get(
//   '/authors',
//   passport.authenticate('jwt', { session: false }),
//   (req, res) => {
//     Books.find().sort({"author": 1})
//       .then((books) => {
//         res.json(books);
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).send('Error: ' + err);
//       });
//   }
// );

// Get book by title
app.get(
  '/books/:title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Books.findOne({ title: req.params.title })
      .then((book) => {
        if (book) {
          res.status(200).json(book);
        } else {
          return res
            .status(400)
            .send(req.params.title + " doesn't exist in the database");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get author by name
// app.get(
//   '/books/authors/:authorName',
//   passport.authenticate('jwt', { session: false }),
//   (req, res) => {
//     Books.findOne({ 'Author.Name': req.params.authorName })
//       .then((book) => {
//         if (book) {
//           res.status(200).json(book.Author);
//         } else {
//           return res
//             .status(400)
//             .send(
//               req.params.authorName + " doesn't exist in the database"
//             );
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send('Error: ' + err);
//       });
//   }
// );

// Get genre by name
// app.get(
//   '/books/genres/:genreName',
//   passport.authenticate('jwt', { session: false }),
//   (req, res) => {
//     Books.findOne({ 'Genre.Name': req.params.genreName })
//       .then((book) => {
//         if (book) {
//           res.status(200).json(book.Genre);
//         } else {
//           return res
//             .status(400)
//             .send(req.params.genreName + " doesn't exist in the database");
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).send('Error: ' + err);
//       });
//   }
// );

// Create new user
app.post(
  '/users',
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check(
      'username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res
            .status(400)
            .send(req.body.username + 'already exists');
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
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
  }
);

// Add new book
app.post(
  '/books',
  [
    check('title', 'Title is required'),
    check('author', 'Author is required'),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Books.findOne({ title: req.body.title })
      .then((book) => {
        if (book) {
          return res.status(400).send(req.body.title + 'already exists');
        } else {
          Books.create({
            image: req.body.image,
            title: req.body.title,
            author: req.body.author,
            genre: req.body.genre,
            series: req.body.series,
            number: req.body.number,
            description: req.body.description,
            favorite: req.body.favorite,
          })
            .then((book) => {
              res.status(201).json(book);
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
  }
);

// Update user info by username
app.put(
  '/users/:username',
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check(
      'username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Post new book to favorites
app.post(
  '/users/:username/books/:bookId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $push: { favorites: req.params.bookId },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Delete user's book from favorites list
app.delete(
  '/users/:username/books/:bookId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { favorites: req.params.bookId } },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Delete user by username
app.delete(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
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
  }
);

// Get all users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get user by username
app.get(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ username: req.params.username })
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
