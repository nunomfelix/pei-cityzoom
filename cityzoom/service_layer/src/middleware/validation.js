const validationDebug = require('debug')('app:ValidationMiddleware')

/*  Middleware to ease the validation of user inputs
    method: Validation function to run
    object: The key attribute of the request to validate (params, body...)
    message: Message to display to the user
*/
function validationMiddleware(method, object, message) {
    return function(req, res, next) {
        const { error } = method(req[object])
        if(error) {
            validationDebug(`An error occurred while validating ${JSON.stringify(req[object])} on the endpoint ${req.originalUrl} with the function ${method}`)
            res.status(400).send(message)
        } else {
            next()
        }
    }
}

module.exports = {
    validationMiddleware
}