const validationDebug = require('debug')('app:ValidationMiddleware')
const jwt = require('jsonwebtoken')
const User = require('../db/models/user')
const { TOKEN_GENERATION_SECRET } = require('../index')

/*  Middleware to ease the validation of user inputs
    method: Validation function to run
    object: The key attribute of the request to validate (params, body...)
    message: Message to display to the user
*/
function validationMiddleware(method, object, message = null, code = 400) {
    return function (req, res, next) {
        const { error } = method(req[object])
        if (error) {
            validationDebug(`Error occurred while validating ${JSON.stringify(req[object])} on the endpoint ${req.originalUrl} with the function ${method.name}:\n${error.message}`)
            res.status(code).send(message ? message : error.message)
        } else {
            next()
        }
    }
}

const authentication = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, TOKEN_GENERATION_SECRET)
        const user = await User.findOne({ username: decoded.username })
        if (!user) {
            return res.status(401).send('Please authenticate.')
        }
        req.user = user
        next()
    } catch (e) {
        res.status(401).send('Please authenticate.')
    }
}

module.exports = {
    validationMiddleware,
    authentication
}