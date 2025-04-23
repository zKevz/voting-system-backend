const express = require('express')
const router = express.Router()

const auth = require('./auth')
const user = require('./user')
const voting = require('./voting')

router.use('/auth', auth)
router.use('/users', user)
router.use('/votings', voting)

module.exports = router
