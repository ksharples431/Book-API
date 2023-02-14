const bodyParser = require('body-parser');
      express = require('express');
      morgan = require('morgan');
      fs = require('fs');
      path = require('path');
      // methodOverride = require('method-override');

const app = express();

let topBooks = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Lord of the Rings',
    author: 'J.R.R. Tolkien',
  },
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Harry Potter and the Prisoner of Azkaban',
    author: 'J.K. Rowling',
  },
  {
    title: 'Harry Potter and the Goblet of Fire',
    author: 'J.K. Rowling',
  },
  {
    title: 'Harry Potter and the Order of the Phoenix',
    author: 'J.K. Rowling',
  },
  {
    title: 'Harry Potter and the Half-Blood Prince',
    author: 'J.K. Rowling',
  },
  {
    title: "Harry Potter and the Deathly Hallows",
    author: 'J.K. Rowling',
  },
  {
    title: 'The Stand',
    author: 'Stephen King',
  },
  {
    title: 'Misery',
    author: 'Stephen King',
  },
];

// Logger middleware
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'log.txt'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my book club!');
});

app.get('/books', (req, res) => {
  res.json(topBooks);
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
// app.use(methodOverride());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
