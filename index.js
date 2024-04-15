const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
app.use(cors());
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  })
);
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

// Generate random Id
const generateRandomId = () => {
  const randomId = Math.floor(100000 * Math.random() * 999999);
  return randomId;
};

// post method
app.post("/api/persons", (req, res) => {
  const tempPerson = req.body;

  // Name is not empty
  if (!tempPerson.name) {
    res.status(400).json({ error: "Name is missing" });
    return;
  }
  // Number is not empty
  if (!tempPerson.number) {
    res.status(400).json({ error: "Number is missing" });
    return;
  }
  // Check name is unique
  const person = persons.find(
    (person) => person.name.toLowerCase === tempPerson.name.toLowerCase()
  );

  if (person) {
    res.status(400).json({ error: "Name must be unique" });
  }

  const newPerson = {
    id: generateRandomId(),
    name: req.body.name,
    number: req.body.number,
  };
  persons = persons.concat(newPerson);
  res.json(newPerson);
});

// Delete method
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

app.get("/info", (req, res) => {
  res.send(
    `<p>Phoneboook has info for ${persons.length}people <br> ${new Date()}</p>`
  );
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
