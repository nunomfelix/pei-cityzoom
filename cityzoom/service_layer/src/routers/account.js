const express = require('express')
const router = new express.Router()

/* Contains all account endpoints */

router.get('/account', (req, res) => {
    res.send('From accounts file')
})

module.exports = router