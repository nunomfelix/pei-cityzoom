const config = require('config')
const fs = require('fs')
const valDebug = require('debug')('app:Validation')

function validation(method, object, message=null, code=400) {
    return function (req, res, next) {
        const { err } = method(req[object])
        if (err) {
            valDebug(`Error validating: ${JSON.stringify(req[object])}`)
            res.status(code).send(message ? message : err.message)
        } else {
            next()
        }
    }
}

module.exports = {
    validation
}