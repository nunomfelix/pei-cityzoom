const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const axios = require('axios')

//Imports routes
const streamRouter = require('./routes/streams')
const subscriptions = require('./routes/subscriptions')

//Uses the express framework
const app = express()

//Uses specified port in env variable. Uses port 8001 as if none is given
const port = process.env.PORT || 8001

app.use(express.json())
app.use(morgan('dev'))
app.use(helmet())


//Sets up all routes
app.use('/czb/stream',streamRouter)
app.use('/czb/subscription',subscriptions)


app.listen(port, () => { console.log('listen in port 8001') })

//routes.initialize(app);
