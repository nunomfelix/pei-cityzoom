const validationDebug = require('debug')('app:ValidationMiddleware')

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

module.exports = {
    validationMiddleware
}