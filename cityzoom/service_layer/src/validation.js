const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);

function validateId(object) {
    const schema = {
        id: Joi.objectId()
    }
    return Joi.validate(object, schema)
}

module.exports = {
    validateId
}