const config = require('config')
const fs = require('fs')
const valDebug = require('debug')('app:Validation')
const errorDebug = require('debug')('app:Error')


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

function error(err, req, res, next) {
    fs.appendFileSync('logfile.log', new Date().toISOString() + " - " + err.message + ', requestpath: ' + req.originalUrl + ', request body: ' + JSON.stringify(req.body) + '\n');
    errorDebug(err.message + ', requestpath: ' + req.originalUrl + ', request body: ' + JSON.stringify(req.body))
    res.status(500).send()
}

module.exports = {
    validation,
    error
}