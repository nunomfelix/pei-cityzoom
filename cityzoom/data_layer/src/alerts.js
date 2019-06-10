const config = require('config')
const alertsDebug = require('debug')('app:AlertManager')
//Broker connection
const Satellites = require('./db/models/satellite')
const Values = require('./db/models/values')
const Alerts = require('./db/models/alerts')
const Triggers = require('./db/models/triggers')

// yearly alerts
const anos = () => { setInterval(async () => {

    alertsDebug('[DEBUG] Checking all yearly alarms')
    let alerts = await Alerts.find({frequency: "YEAR"})

    for (var i = 0; i < alerts.length; i++) {
        alert = alerts[i]
        let end = new Date().getTime();
        const start=end-1000*60*60*24*365
        if (alert.target=='Municipality') {
            alertsDebug('[DEBUG] Checking municipality alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': alert.target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }, 
                        'municipality': mun 
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }
        else if (alert.target=='Hexagon') {
            alertsDebug('[DEBUG] Checking hexagon alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }, 
                        'hexagon': hexa
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }
        else {
            alertsDebug('[DEBUG] Checking global alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }

        const satellites = await Satellites.aggregate(aggregation)
        const values = await Values.aggregate(aggregation)
        const tmp = values + satellites 
        if (tmp.length!=0 && !alert.active && alert.lastOKRead==null) {
            alertsDebug('[DEBUG] Alert!!!')
            alertsDebug('[DEBUG] last OK Read: '+alert.lastOKRead)
            await Triggers.create({
                alert_ID: alert.alert_ID,
                timestamp: (new Date()).getTime(),
                causes: tmp,
                users: alert.users
            })
            alertsDebug('[DEBUG] Alert last OK READ: '+tmp[0].average)
            await Alerts.updateOne({alert_ID:alert.alert_ID},{lastOKRead:tmp[0].average})
        } else if (tmp.length==0) {
            await Alerts.updateOne({alert_ID:alert.alert_ID},{lastOKRead:null})
        }
    }
}, 1000*60*60*24)
}

const dias = () => { setInterval(async () => {

    alertsDebug('[DEBUG] Checking all daily alarms')
    let alerts = await Alerts.find({frequency: "DAY"})

    for (var i = 0; i < alerts.length; i++) {
        alert = alerts[i]
        let end = new Date().getTime();
        const start=end-1000*60*60*24
        if (alert.target=='Municipality') {
            alertsDebug('[DEBUG] Checking municipality alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': alert.target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }, 
                        'municipality': mun 
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }
        else if (alert.target=='Hexagon') {
            alertsDebug('[DEBUG] Checking hexagon alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }, 
                        'hexagon': hexa
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }
        else {
            alertsDebug('[DEBUG] Checking global alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }

        const satellites = await Satellites.aggregate(aggregation)
        const values = await Values.aggregate(aggregation)
        const tmp = values + satellites 
        if (tmp.length!=0 && !alert.active && alert.lastOKRead==null) {
            alertsDebug('[DEBUG] Alert!!!')
            alertsDebug('[DEBUG] last OK Read: '+alert.lastOKRead)
            await Triggers.create({
                alert_ID: alert.alert_ID,
                timestamp: (new Date()).getTime(),
                causes: tmp,
                users: alert.users
            })
            alertsDebug('[DEBUG] Alert last OK READ: '+tmp[0].average)
            await Alerts.updateOne({alert_ID:alert.alert_ID},{lastOKRead:tmp[0].average})
        } else if (tmp.length==0) {
            await Alerts.updateOne({alert_ID:alert.alert_ID},{lastOKRead:null})
        }
    }
}, 1000*60*60) 
}

const horas = () => { setInterval(async () => {

    alertsDebug('[DEBUG] Checking all hourly alarms')
    let alerts = await Alerts.find({frequency: "HOUR"})

    for (var i = 0; i < alerts.length; i++) {
        alert = alerts[i]
        let end = new Date().getTime();
        const start=end-1000*60*60*24
        if (alert.target=='Municipality') {
            alertsDebug('[DEBUG] Checking municipality alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': alert.target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }, 
                        'municipality': mun 
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }
        else if (alert.target=='Hexagon') {
            alertsDebug('[DEBUG] Checking hexagon alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }, 
                        'hexagon': hexa
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }
        else {
            alertsDebug('[DEBUG] Checking global alert')
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }, {
                    '$match': {
                        'average': {
                            [`${alert.type=='MAX' ? '$gt' : alert.type=='MAXEQ' ? '$gte' : alert.type=='MIN' ? '$lt' : '$lte'}`]: alert.value
                        }
                    }
                }
            ]
        }

        const satellites = await Satellites.aggregate(aggregation)
        const values = await Values.aggregate(aggregation)
        const tmp = values + satellites 
        if (tmp.length!=0 && !alert.active && alert.lastOKRead==null) {
            alertsDebug('[DEBUG] Alert!!!')
            alertsDebug('[DEBUG] last OK Read: '+alert.lastOKRead)
            await Triggers.create({
                alert_ID: alert.alert_ID,
                timestamp: (new Date()).getTime(),
                causes: tmp,
                users: alert.users
            })
            alertsDebug('[DEBUG] Alert last OK READ: '+tmp[0].average)
            await Alerts.updateOne({alert_ID:alert.alert_ID},{lastOKRead:tmp[0].average})
        } else if (tmp.length==0) {
            await Alerts.updateOne({alert_ID:alert.alert_ID},{lastOKRead:null})
        }
    }
}, 1000*60)
}

anos()
dias()
horas()