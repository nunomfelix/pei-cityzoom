const joi = require('joi')

function validateCreateDevice(object) {
    const schema = joi.object().keys({
        device_ID:  joi.string().required(),
        device_name: joi.string().required(),
        description: joi.string().optional(),
        verticals: joi.array().required(),
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
        longitude: joi.number().required(),
        timestamp: joi.number().optional(),
        device_ID: joi.string().optional(),
        satellite: joi.boolean().optional()
    })
    return joi.validate(object, schema)
}

function validateCreateAlert(object) {
    const schema = joi.object().keys({
        alert_ID: joi.string().required(),
        alert_name: joi.string().required(),
        value: joi.number().required(),
        type: joi.string().required().valid('MAX','MAXEQ','MIN','MINEQ'),
        frequency: joi.string().required().valid('YEAR','DAY','HOUR'),
        target: joi.string().required().valid('Global','Municipality','Hexagon'),
        target_stream: joi.string().required(),
        level: joi.string().required().valid('neutral','bad','really bad'),
        target_id: joi.array().items(joi.string()).optional(),
        description: joi.string().optional(),
        notify_mail: joi.boolean().optional(),
        users: joi.array().items(joi.string()).required()
    })
    return joi.validate(object,schema)
}

function validatePatchAlert(object){
    const schema = joi.object().keys({
        parameter : joi.string().required(),
        value     : joi.string().required()
    })
    return joi.validate(object,schema)
}

function validateDismissAlert(object) {
    const schema = joi.object().keys({
        user: joi.string().required()
    })
    return joi.validate(object, schema)
}

module.exports = {
    validateCreateDevice,
    validateCreateStream,
    validatePostValue,
    validateCreateAlert,
    validatePatchAlert,
    validateDismissAlert
}
