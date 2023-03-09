const bodyParser = require('body-parser'),
  express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const { check, validationResult } = require('express-validator');

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

// Cors middleware
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          `The CORS policy for this application doesn’t allow access from origin ` +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

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

// Get book by title
app.get(
  '/books/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Books.findOne({ Title: req.params.Title })
      .then((book) => {
        if (book) {
          res.status(200).json(book);
        } else {
          return res
            .status(400)
            .send(req.params.Title + " doesn't exist in the database");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get author by name
app.get(
  '/books/authors/:authorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Books.findOne({ 'Author.Name': req.params.authorName })
      .then((book) => {
        if (book) {
          res.status(200).json(book.Author);
        } else {
          return res
            .status(400)
            .send(
              req.params.authorName + " doesn't exist in the database"
            );
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Get genre by name
app.get(
  '/books/genres/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  }
);

// Create new user
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res
            .status(400)
            .send(req.body.Username + 'already exists');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
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
  }
);

// Update user info by username
app.put(
  '/users/:Username',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Post new book to favorites
app.post(
  '/users/:Username/books/:BookID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { Favorites: req.params.BookID },
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
  '/users/:Username/books/:BookID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { Favorites: req.params.BookID } },
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
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
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
