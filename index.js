console.log('hello there, Web 36!')

const express = require('express')
const shortid = require('shortid')

const server = express()

// configure our server (PLUG FUNCTIONALITY)
server.use(express.json()) // add the ability to read the body of the request as JSON

// fake Users table inside a fake Lambda user db
let users = [
    { id: '?', name: 'Jane Doe', bio: "Not Tarzan's Wife, another Jane"}
]

// helper functions to interact with the Users fake table
const User = {
    getAll() {
        return users
    },
    getById(id) {
        return users.find(user => user.id === id)
    },
    createNew(user) {
        // make a user object using user from client
        const newUser = { id: shortid.generate(), ...user }
        // add it to the users array
        users.push(newUser)
        // return the newly created user (with all the bits)
        return newUser
    },
    delete(id) {
        // find the user by that id
        const user = users.find(user => user.id === id)
        // if user there perform the delete and return the deleted
        if (user) {
            users.find(user => user.id !== id)
        }
        return user
    },
    udpdate(id, changes) {
        const user = users.find(user => user.id === id)
        if (!user) {
            return null
        }   else {
            // smash the users with a new one
            users = users.map(u => {
                if (u.id === id) return { id, ...changes}
                return u
            })
            // return updated dog
            return { id, ...changes }
        }
    }
}

// endpoints for Users
server.get('/api/users', (req, res) => {
    // 1- gather info for the request object
    // 2- interact with db
    const users = User.getAll()
    console.log('all the users', users)
    // 3- sent to client on appropriate response
    res.status(200).json(users)
})
server.get('/api/users/:id', (req, res) => {
    // 1- gather info for the request object
    const { id } = req.params
    // 2- interact with db
    const user = User.getById(id)
    // 3- sent to client on appropriate response
    if (user) {
        res.status(200).json(user)
    }   else {
        res.status(404).json({ message: 'The user with the specified ID does not exist.'})
    }
})
server.post('/api/users', (req, res) => {
    // EXPRESS, BY DEFAULT IS NOT PARSING THE BODY OF THE REQUEST
    // 1- gather info for the request object
    const userFromClient = req.body

    if (!userFromClient.name || !userFromClient.bio) {
        // crude validation of req.body
        res.status(400).json({ message: 'Please provide name and bio for the user.'})
    }   else {
           // 2- interact with db
           const newlyCreatedUser = User.createNew(userFromClient)
           // 3- sent to client on appropriate response
           res.status(201).json(newlyCreatedUser)
    }
})
server.delete('/api/users/:id', (req, res) => {
    // 1- gather info for the request object
    const { id } = req.params
    // 2- interact with db
    const deleted = User.delete(id)
    // 3- sent to client on appropriate response
    if (deleted) {
        res.status(200).json(deleted)
    } else {
        res.status(404).json({ message: 'The user with the specified ID does not exist' + id })
    }
})
server.put('api/users/:id', (req, res) => {
    const changes = req.body
    const { id } = req.params
    const updateUser = User.update(id, changes)
    if (updateUser) {
        res.status(200).json(updateUser)
    } else {
        res.status(404).json({ message: 'The user with the specified ID does not exist'})
    }
})

// catch-all endpoint
server.use('*', (req, res) => {
    res.status(404).json({ message: 'not found'})
})

// start the server
server.listen(5000, () => {
    console.log('listening on port 5000')
})
