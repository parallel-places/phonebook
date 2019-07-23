const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

let persons = [
      {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
]

// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     next()
// }

morgan.token('data', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(res.req.body)
    }
})

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
// app.use(requestLogger)

app.get('/', (req, res) => res.send('Phonebook App'))
app.get('/api/persons', (req, res) => res.status(200).json(persons))
app.get('/info', (req, res) => {
    res.send(`<p>phonebook has ${persons.length} entries.</p><p>${new Date().toString()}</p>`)
})
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const match = persons.find(p => p.id === id)
    if (match) res.json(match)
    else res.status(404).end()
})
app.delete('/api/persons/:id', (req, res) => {
    persons = persons.filter(p => p.id !== Number(req.params.id))
    res.status(204).end()
})
app.post('/api/persons', (req, res) => {
    const data = req.body

    if (!data.name) {
        return res.status(400).json({error: "name field is missing"})
    } else if (!data.number) {
        return res.status(400).json({error: "number field is missing"})
    } else if (persons.find(p => p.name.toLowerCase() === data.name.toLowerCase())) {
        return res.status(400).json({error: "name must be unique"})
    }

    const newEntry = {
        name: data.name,
        number: data.number,
        id: Math.floor(Math.random() * 2**32),
    }

    persons = persons.concat(newEntry)
    res.json(newEntry)
})

app.use((request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
