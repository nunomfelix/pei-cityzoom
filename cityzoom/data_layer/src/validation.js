const joi = require('joi')

function validateCreateDevice(object) {
    const schema = joi.object().keys({
        device_ID:  joi.string().required(),
        device_name: joi.string().required(),
        description: joi.string().optional(),
        vertical: joi.array().required(),
        mobile: joi.boolean().required(),
        provider: joi.string().required(),
        municipality: joi.string().optional()
    })
    return joi.validate(object, schema)
}

function validateCreateStream(object) {
    const schema = joi.object().keys({
        stream_ID: joi.string().required(),
        device_ID: joi.string().required(),
        stream_name: joi.string().required(),
        type: joi.string().optional(),
        description: joi.string().optional()
    })
    return joi.validate(object, schema)
}

function validatePostValue(object) {
    const schema = joi.object().keys({
        value: joi.number().required(),
        latitude: joi.number().required(),
        longitude: joi.number().required()
    })
    return joi.validate(object, schema)
}

function validateCreateAlert(object) {
    const schema = joi.object().keys({
        alert_ID: joi.number().required().,
        alert_name: joi.string().required(),
        thresholds: joi.array().items(
            joi.object().keys({
                stream_ID: joi.string().required(),
                value: joi.number().required(),
                type: joi.string().required().valid(['MAX','MIN','MINEQ','MAXEQ'])
            })
        ),
        level: joi.string().required().valid('neutral','bad','really bad'),
        description: joi.string().optional(),
        active: joi.boolean().required()
    })
}

function validatePostAlert(object){
    const schema = joi.object().keys({
        alert_name   : joi.string().required(),
        threshold    : joi.string().required(),
        type        : joi.string().required(),
        stream_ID   : joi.string().required(),
        level       : joi.string().required(),
        notify_mail : joi.boolean().required()
    })
    return joi.validate(object, schema)
}

module.exports = {
    validateCreateDevice,
    validateCreateStream,
    validatePostValue,
    validatePostAlert
}
