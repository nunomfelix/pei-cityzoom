const User = require('../db/models/user')
const userDebug = require('debug')('app:user')
const express = require('express')
const bcrypt = require('bcryptjs')
require('../db/mongoose')
const { validateId, validatePatch } = require('../validation')
const { validationMiddleware, authentication } = require('../middleware/middleware')

const router = new express.Router()

/* 
    Login user
    req:{
        username: 'pirukamc'
        password: '1234567'
    }
    returns: the session token
    codes:
        [200] Login successful
        [400] Bad request
        [401] Unauthorized (if invalid credentials)
        [500] Internal server error
*/
router.post('/login',
    async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username })
            if (!user) return res.status(400).send('Invalid Credentials')
            const isMatch = await bcrypt.compare(req.body.password, user.password)
            if (!isMatch) return res.status(400).send('Invalid Credentials')

            const token = await user.generateAuthToken()
            userDebug(user)
            userDebug(`User ${user.name} logged in successfully `)
            return res.send({ token })
        } catch (e) {
            userDebug(e)
            res.status(500).send(e.message)
        }
    })

/*
    Gets the authenticated user
    req: no req
    return: the authenticated user
    codes:
        [200] Success
        [401] Unauthorized (no user is logged in)
        [500] Internal server error
*/
router.get('/me',
    authentication,
    async (req, res) => {
        try {
            userDebug(`The autenticated user is ${JSON.stringify(req.user.username)}`)
            res.send(req.user)
        } catch (e) {
            userDebug(e)
            res.status(401).send({ code: 401, message: e.message })
        }
    }
)

/*  Create a user
    req:{
        name: 'André Oliveira',
        username: 'pirukamc',
        email: 'pirukamc@gmail.com',
        password: '1234567'
    }
    returns: authentication token
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
        const token = await user.generateAuthToken()
        res.status(201).send({ token })
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
router.get('',
    async (req, res) => {
        try {
            const result = await User.find(req.query)
            userDebug(`Users loaded with query ${JSON.stringify(req.query)}`)
            res.send(result)
        } catch (e) {
            userDebug(e)
            res.status(500).send(e.message)
        }
    }
)

/*  Gets a user by it's id

    req: no req
    returns: the user with the specified id
    codes:
        [200] Successfully returned user
        [400] Bad request
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
        [400] Bad request
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
            userDebug(e)
            res.status(500).send({
                code: 500,
                message: 'Internal Server Error'
            })
        }
    }
)

/* Changes a user's attributes
    req: {
        password: 'abcDe123!.'
    }
    returns: changes the user's password to abcDe123!.
    codes:
        [200] Successfully modified user
        [400] Bad request
        [404] User not found
        [500] Internal server error
*/
router.patch('/:id',
    [validationMiddleware(validateId, 'params', 'User not found'),
    validationMiddleware(validatePatch, 'body', 'Not allowed to update')],
    async (req, res) => {

        try {
            const user = await User.findById(req.params.id)
            if (!user) {
                userDebug(`Could not find user with username: ${user.username}`)
                return res.status(404).send({
                    code: 404,
                    message: 'User not found'
                })
            }
            //Used this instead of FindOneAndModify because that function does not run the password hashing code
            Object.keys(req.body).forEach((update) => user[update] = req.body[update])
            await user.save()
            userDebug(`User ${user.name} successfully updated`)
            res.status(200).send(user)
        } catch (e) {
            userDebug(e)
            res.status(500).send({
                code: 500,
                message: 'Internal Server Error'
            })
        }
    }
)

module.exports = router