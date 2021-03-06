const User = require('../db/models/user')
const userDebug = require('debug')('app:user')
const express = require('express')
const bcrypt = require('bcryptjs')
const { validateId, validatePatch, validateCreateUser, validateLogin } = require('../validation')
const { validationMiddleware, authentication } = require('../middleware')

const router = new express.Router()

/* 
    Login user
    req:{
        username: 'pirukamc',
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
    validationMiddleware(validateLogin, 'body'),
    async (req, res) => {
        const user = await User.findOne({ username: req.body.username })
        if (!user) return res.status(400).send('Invalid Credentials')
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if (!isMatch) return res.status(400).send('Invalid Credentials')

        const jwt = await user.generateAuthToken()
        userDebug(`User ${user.name} logged in successfully `)
        return res.send({ ...user._doc, jwt })
    }
)

/* 
    Logout user
    req: no req
    returns: the user
    codes:
        [200] Login successful
        [401] Unauthorized (if not logged in)
        [500] Internal server error
*/
router.get('/logout',
    authentication,
    async (req, res) => {
        const user = await User.findById(req.user._id)
        userDebug(`User ${user.name} logged out successfully `)
        return res.send(user)
    }
)

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
        userDebug(`The autenticated user is ${JSON.stringify(req.user.username)}`)
        res.send(req.user)
    }
)

/*  Create a user
    req:{
        name: 'André Oliveira',
        username: 'pirukamc',
        email: 'pirukamc@gmail.com',
        password: '1234567'
    }
    returns: Created user
    codes:
        [201] Created user
        [400] Bad request
        [500] Internal server error
*/
router.post('',
    [validationMiddleware(validateCreateUser, 'body')],
    async (req, res) => {
        let user;
        try {
            user = new User(req.body)
            await user.save()
        } catch (e) {
            const err = e.errors[Object.keys(e.errors)[0]]
            if (err.kind == "unique") {
                return res.status(400).send(err.path + " '" + err.value + "' already exists")
            }
        }
        userDebug(`User ${user.name} successfully created`)
        res.status(201).send(user)
    }
)

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
    authentication,
    async (req, res) => {
        const result = await User.find(req.query)
        userDebug(`Users loaded with query ${JSON.stringify(req.query)}`)
        res.send(result)
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
    [authentication, validationMiddleware(validateId, 'params', 'Invalid ID')],
    async (req, res) => {
        const user = await User.findById(req.params.id)
        if (!user) {
            userDebug(`User with ID: ${req.params.id} not found!`)
            return res.status(404).send('User not found')
        }
        userDebug(`User with ID: ${req.params.id} sent.`)
        res.send(user)
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
    [authentication, validationMiddleware(validateId, 'params', 'User not found')],
    async (req, res) => {
        const user = await User.deleteOne({ _id: req.params.id })
        if (!user) {
            return res.status(404).send({
                code: 404,
                message: 'User not found'
            })
        }
        res.status(200).send(user)
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
router.patch('/:id', [
    authentication,
    validationMiddleware(validateId, 'params', 'User not found'),
    validationMiddleware(validatePatch, 'body', 'Not allowed to update')
],
    async (req, res) => {
        const user = await User.findById(req.params.id)
        if (!user) {
            userDebug(`Could not find user with username: ${user.username}`)
            return res.status(404).send('User not found')
        }
        //Used this instead of FindOneAndModify because that function does not run the password hashing code
        user = { ...user, ...req.body }
        await user.save()
        userDebug(`User ${user.name} successfully updated`)
        res.status(200).send(user)
    }
)

module.exports = router