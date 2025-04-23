const express = require('express')
const BaseResponse = require('../response/base')

const router = express.Router()

const userService = require('../services/user')

router.get('/', async (req, res) => {
    if (req.role !== 'admin') {
        res.json(BaseResponse.error(500, 'Unauthorized'))
        return
    }

    try {
        const users = await userService.getAllUsers()
        const response = users.map(user => {
            return {
                id: user._id,
                role: user.role,
                votedFor: user.votedFor,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        })

        res.json(BaseResponse.success(response))
    } catch (error) {
        res.json(BaseResponse.error(500, error.toString()))
    }
})


router.get('/me', async (req, res) => {
    try {
        const user = await userService.findOneById(req.userId)
        res.json(BaseResponse.success({
            role: user.role,
            userId: user._id,
            votedFor: user.votedFor,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }))
    } catch (error) {
        res.json(BaseResponse.error(500, error.toString()))
    }
})

router.delete('/', async (req, res) => {
    if (req.role !== 'admin') {
        res.json(BaseResponse.error(500, 'Unauthorized'))
        return
    }

    const { id } = req.query

    if (!id) {
        res.json(BaseResponse.error(500, 'ID missing'))
    }

    try {
        await userService.deleteUserById(id)

        res.json(BaseResponse.success())
    } catch (error) {
        res.json(BaseResponse.error(500, error.toString()))
    }
})

module.exports = router
