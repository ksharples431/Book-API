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
  },
  {
    uid: 'etienne.kroger',
    name: 'Etienne Kroger',
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

// GET/Read requests
app.get('/', (req, res) => {
  res.send('Welcome to my book club!');
});

app.get('/users', (req, res) => {
  res.status(200).json(users);
});

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

app.get('/books', (req, res) => {
  res.status(200).json(books);
});

app.get('/books/:title', (req, res) => {
  // const title = req.params.title;
  const { title } = req.params;
  const book = books.find((book) => book.title === title);
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(400).send('Book not found');
  }
});

app.get('/books/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = books.find((book) => book.genre.name === genreName).genre;
  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('Genre not found');
  }
});

app.get('/books/author/:authorName', (req, res) => {
  const { authorName } = req.params;
  const author = books.find((book) => book.author.name === authorName).author;
  if (author) {
    res.status(200).json(author);
  } else {
    res.status(400).send('Author not found');
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
