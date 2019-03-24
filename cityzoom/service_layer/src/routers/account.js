const express = require('express')
require('../db/mongoose')
const User = require('../db/models/user')

const router = new express.Router()

/*  Creates a user
    req:{
        name: 'myname',
        email: 'email',
        password: ''
    }
    returns: the inserted user with id
    codes:
        [201] Created user
        [400] Bad request
        [500] Internal server error
*/
router.post('/users', (req, res) => {
    const user = new User(req.body)
    user.save().then(() => {
        res.status(201).send(user)
    }).catch((e) => {
        console.log(e)
        res.status(400).send({
            code: 400,
            message: e.message
        })
    })
})

/*  Gets the list of users whose attributes match the ones in the queries
    Returns the list of all users, if no query is provided

    queries:/users?name=John&email=john@gmail.com (users whose name is John and email is john@gmail.com)
    req: no req
    returns: list of users that match queries
    codes:
        [200] Successfully returned users
        [500] Internal server error
*/
router.get('/users', (req, res) => {
    User.find(req.query).then((result) => {
        res.status(200).send(result)
    }).catch((e) => {
        console.log(e)
        res.status(500).send({
            code: 500,
            message: e.message
        })
    })
})

/*  Gets a user by it's id

    req: no req
    returns: the user with the specified id
    codes:
        [200] Successfully returned user
        [404] User not found
        [500] Internal server error
*/
router.get('/users/:id', (req, res) => {
    User.findById(req.params.id).then((user) => {
        if (!user) {
            return res.status(404).send({
                code: 404,
                message: 'User not found'
            })
        }
        res.status(200).send(user)
    }).catch((e) => {
        console.log(e)
        res.status(500).send({
            code: 500,
            message: 'Internal Server Error'
        })
    })
})

module.exports = router