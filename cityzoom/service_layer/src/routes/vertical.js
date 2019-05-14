const express = require('express')
const router = express.Router()
const Vertical = require('../db/models/vertical')


router.get('', async (req,res) => {
    const verticals = await Vertical.find(req.query)
    res.send(verticals)

})

module.exports = router




