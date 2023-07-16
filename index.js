const express = require('express')
const morgan = require('morgan')
const app = express()

const cors = require('cors')
app.use(cors())

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(express.json())

morgan.token('body', function (req) {
    return JSON.stringify(req.body)
})

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    (req.method === 'POST' ? tokens['body'](req) : '')
  ].join(' ')
}))

app.use(express.static('build'))

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const personId = Number(request.params.id)
  const person = persons.find((({id}) => id === personId))

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const personId = Number(request.params.id)
  persons = persons.filter(({id}) => id !== personId)

  response.status(204).end()
})

const generateId = () => {
  let maxId = persons.length > 0
    ? Math.max(...persons.map(({id}) => id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  let body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  } else if (persons[body.name]) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  let person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  
  response.json(person)
})

app.get('/info', (request, response) => {
  const date = new Date()
  const html = `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`

  response.send(html)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

