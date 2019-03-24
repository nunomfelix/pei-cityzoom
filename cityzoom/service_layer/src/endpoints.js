const express = require('express')

/* Server setup configurations */

//Imports routes
const accountRouter = require('./routers/account')
const alertRouter = require('./routers/alert')
const resourceRouter = require('./routers/resource')
//Uses the express framework
const app = express()
//Uses specified port in env variable. Uses port 3000 as if none is given
const port = process.env.PORT || 3000
//Sets up all routes
app.use(express.json())
app.use(accountRouter)
app.use(alertRouter)
app.use(resourceRouter)

app.listen(port, () => {
    console.log('Service Layer up on port ' + port)
})

