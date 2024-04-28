const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const cors = require('cors');

const Person = require('./models/phone');

app.use(cors());
// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];
app.use(express.static('dist'));
app.use(express.json());
app.use(
  morgan((tokens, req, res) => [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    JSON.stringify(req.body),
  ].join(' ')),
);
const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  next(error);
};

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});
app.get('/api/persons', (req, res) => {
  Person.find({}).then((person) => {
    res.json(person);
  });
});

app.get('api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

// Generate random Id
const generateRandomId = () => {
  const randomId = Math.floor(100000 * Math.random() * 999999);
  return randomId;
};

// post method
app.post('/api/persons', (req, res, next) => {
  const tempPerson = req.body;

  // Name is not empty
  if (!tempPerson.name) {
    return res.status(400).json({ error: 'Name is missing' });
  }
  // Number is not empty
  if (!tempPerson.number) {
    return res.status(400).json({ error: 'Number is missing' });
  }
  // Check name is unique
  // const person = persons.find(
  //   (person) => person.name.toLowerCase === tempPerson.name.toLowerCase()
  // );

  // if (person) {
  //   res.status(400).json({ error: "Name must be unique" });
  // }

  const newPerson = new Person({
    id: generateRandomId(),
    name: req.body.name,
    number: req.body.number,
  });
  newPerson
    .save()
    .then((savePerson) => {
      res.json(savePerson);
    })
    .catch((error) => next(error));
});

// Edit part of the PhoneBook

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;
  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' },
  )
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// Delete method
app.delete('/api/persons/:id', (req, res, next) => {
  // const id = Number(req.params.id);
  // persons = persons.filter((person) => person.id !== id);
  // res.status(204).end();
  Person.findByIdAndDelete(req.params.id)
    .then((person) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.get('/info', (req, res) => {
  Person.find({}).then((person) => {
    res.send(
      `<p>Phonebook has info for ${person.length}people <br> ${new Date()}</p>`,
    );
  });
});

app.use(errorHandler);
const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
