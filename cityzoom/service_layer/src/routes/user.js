const User = require('../db/models/user')
const userDebug = require('debug')('app:user')
const express = require('express')
require('../db/mongoose')
const { validateId } = require('../validation')
const { validationMiddleware } = require('../middleware/validation')

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
router.post('', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        userDebug(`User ${user.name} successfully created`)
        res.status(201).send(user)
    } catch (e) {
        userDebug(e)
        res.status(500).send(e.message)
    }
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
router.get('', async (req, res) => {
    try {
        const result = await User.find(req.query)
        userDebug(`Users loaded with query ${JSON.stringify(req.query)}`)
        res.send(result)
    } catch (e) {
        userDebug(e)
        res.status(500).send(e.message)
    }
})

/*  Gets a user by it's id

    req: no req
    returns: the user with the specified id
    codes:
        [200] Successfully returned user
        [404] User not found
        [500] Internal server error
*/
router.get('/:id',
    validationMiddleware(validateId, 'params', 'User not found'),
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
            if (!user) {
                userDebug(`User with ID: ${req.params.id} not found!`)
                return res.status(404).send('User not found')
            }
            userDebug(`User with ID: ${req.params.id} sent.`)
            res.send(user)
        } catch (e) {
            userDebug(e)
            res.status(500).send()
        }
    }
)

/* Deletes a user by it's id
    req: no req
    returns: the user with the specified id
    codes:
        [200] Successfully deleted user
        [404] User not found
        [500] Internal server error
*/
router.delete('/:id',
    validationMiddleware(validateId, 'params', 'User not found'),
    async (req, res) => {
        const user = await User.deleteOne({ _id: req.params.id })
        try {
            if (!user) {
                return res.status(404).send({
                    code: 404,
                    message: 'User not found'
                })
            }
            res.status(200).send(user)
        } catch (e) {
            console.log(e)
            res.status(500).send({
                code: 500,
                message: 'Internal Server Error'
            })
        }
    }
)


module.exports = router