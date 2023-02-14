const bodyParser = require('body-parser');
express = require('express');
morgan = require('morgan');
fs = require('fs');
path = require('path');
uuid = require('uuid');

// Initialize express
const app = express();

// Body parser
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Local data
let users = [
  {
    uid: 'ksharples431',
    name: 'Katie Sharples',
    favoriteBooks: []

  },
  {
    uid: 'etienne.kroger',
    name: 'Etienne Kroger',
    favoriteBooks: ['Life of Pi']
  },
];

let books = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: { name: 'J.K. Rowling' },
    genre: {
      name: 'Fantasy',
      description: 'Strange new worlds',
    },
  },
  {
    title: 'Lord of the Rings',
    author: { name: 'J.R.R. Tolkien'}
  },
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: {name: 'J.K. Rowling'}
  },
  {
    title: 'Harry Potter and the Prisoner of Azkaban',
    author: { name: 'J.K. Rowling'}
  },
  {
    title: 'Harry Potter and the Goblet of Fire',
    author: { name: 'J.K. Rowling'}
  },
  {
    title: 'Harry Potter and the Order of the Phoenix',
    author: { name: 'J.K. Rowling'}
  },
  {
    title: 'Harry Potter and the Half-Blood Prince',
    author: { name: 'J.K. Rowling'}
  },
  {
    title: 'Harry Potter and the Deathly Hallows',
    author: { name: 'J.K. Rowling'}
  },
  {
    title: 'The Stand',
    author: { name: 'Stephen King'}
  },
  {
    title: 'Misery',
    author: { name: 'Stephen King'}
  },
];

// Logger middleware
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'log.txt'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

// Serve static files
app.use(express.static('public'));

// POST/Create requests 
// Create new user
app.post('/users', (req, res) => {
  const newUser = req.body;
  if (newUser.name) {
    newUser.uid = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser) 
  } else {
    res.status(400).send('User not created')
  }
});

// GET/Read requests
// Get hompage message
app.get('/', (req, res) => {
  res.send('Welcome to my book club!');
});

// Get all users
app.get('/users', (req, res) => {
  res.status(200).json(users);
});

// Get user by id
app.get('/users/:uid', (req, res) => {
  // const title = req.params.title;
  const { uid } = req.params;
  const user = users.find((user) => user.uid === uid);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400).send('User not found');
  }
});

// Get all books
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// Get book by title
app.get('/books/:title', (req, res) => {
  const { title } = req.params;
  const book = books.find((book) => book.title === title);
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(400).send('Book not found');
  }
});

// Get genre by name
app.get('/books/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = books.find((book) => book.genre.name === genreName).genre;
  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('Genre not found');
  }
});

// Get author by name
app.get('/books/author/:authorName', (req, res) => {
  const { authorName } = req.params;
  const author = books.find((book) => book.author.name === authorName).author;
  if (author) {
    res.status(200).json(author);
  } else {
    res.status(400).send('Author not found');
  }
});

// PUT/Update requests
// Update user's name
app.put('/users/:uid', (req, res) => {
  const { uid } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.uid == uid);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user)
  } else {
    res.status(400).send('User not found');
  }
});

// Update user's book list
app.put('/users/:uid/:bookTitle', (req, res) => {
  const { uid, bookTitle } = req.params;

  let user = users.find((user) => user.uid == uid);

  if (user) {
    user.favoriteBooks.push(bookTitle);
    res.status(200).send(`${bookTitle} has been added to ${uid}'s array`);
  } else {
    res.status(400).send('Favorite book not added');
  }
});

// DELETE requests
// Delete user's book list
app.delete('/users/:uid/:bookTitle', (req, res) => {
  const { uid, bookTitle } = req.params;

  let user = users.find((user) => user.uid == uid);

  if (user) {
    user.favoriteBooks = user.favoriteBooks.filter( title => title !== bookTitle)
    res.status(200).send(`${bookTitle} has been deleted from ${uid}'s array`);
  } else {
    res.status(400).send('Favorite book not added');
  }
});

// Delete user
app.delete('/users/:uid/', (req, res) => {
  const { uid } = req.params;

  let user = users.find((user) => user.uid == uid);

  if (user) {
    users = users.filter( user => user.uid !== uid)
    res.status(200).send(`${user.uid} has been deleted`);
  } else {
    res.status(400).send('No user found');
  }
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
