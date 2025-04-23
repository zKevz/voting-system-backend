const express = require('express')
const User = require('../models/user')
const BaseResponse = require('../response/base')
const router = express.Router()
const authService = require('../services/auth')

router.post('/register', async (req, res) => {
    try {
        if (!req.body) {
            return res.json(BaseResponse.error(500, 'Missing body'))
        }

        const { username, password } = req.body
        if (!username) {
            return res.json(BaseResponse.error(500, 'Missing username'))
        }

        if (!password) {
            return res.json(BaseResponse.error(500, 'Missing username'))
        }

        const token = await authService.onRegister(username, password)
        res.status(201).json(BaseResponse.success({ token }))
    } catch (error) {
        res.status(200).json(BaseResponse.error(500, error.toString()))
    }
})

router.post('/login', async (req, res) => {
    try {
        if (!req.body) {
            return res.json(BaseResponse.error(500, 'Missing body'))
        }

        const { username, password } = req.body

        if (!username) {
            return res.json(BaseResponse.error(500, 'Missing username'))
        }

        if (!password) {
            return res.json(BaseResponse.error(500, 'Missing username'))
        }

        const token = await authService.onLogin(username, password)
        res.status(200).json(BaseResponse.success({ token }))
    } catch (error) {
        res.status(200).json(BaseResponse.error(500, error.toString()))
    }
})

module.exports = router
