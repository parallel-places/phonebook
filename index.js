require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('data', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(res.req.body)
    }
})

const app = express()
const update = (req, res, next) => {
    const data = req.body

    const entry = {
        name: data.name,
        number: data.number
    }

    Person.findByIdAndUpdate(req.params.id, entry, { new: true })
        .then(updatedEntry => {
            res.json(updatedEntry.toJSON())
        })
        .catch(error => next(error))
}

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/', (req, res) => res.send('Phonebook App'))

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons.map(person => person.toJSON()))
    })
})

app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        res.send(`<p>phonebook has ${persons.length} entries.</p><p>${new Date().toString()}</p>`)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(result => {
            if (result) {
                res.json(result.toJSON())
            } else  {
                console.log('requested id not found')
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => res.status(204).end())
        .catch(error => next(error))
})

app.put('/api/persons/:id', update)

app.post('/api/persons', (req, res) => {
    const data = req.body

    if (!data.name) {
        return res.status(400).json({error: "name field is missing"})
    } else if (!data.number) {
        return res.status(400).json({error: "number field is missing"})
    } else {
        Person.findOne({name: data.name})
            .then(person => {
                if (person !== null) {
                    // res.status(400).json({error: "name must be unique"})
                    const id = person.toJSON().id
                    // res.redirect(302, '/api')
                    req.params.id = id
                    update(req, res, next)
                } else {
                    const newEntry = new Person({
                        name: data.name,
                        number: data.number,
                    })

                    newEntry.save().then(savedEntry => {
                        res.json(savedEntry.toJSON())
                    })
                }
            })
            .catch(error => console.log('error in post', error.message))
    }
})

app.use((req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
})

app.use((error, req, res, next) => {
    console.error(error.message)
    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return res.status(400).send({error: 'incorrect id format'})
    }
    next(error)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log('environment variables: ', process.env)
    console.log(`Server is running on port ${PORT}`)
})
