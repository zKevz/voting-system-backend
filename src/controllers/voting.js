const express = require('express')
const BaseResponse = require('../response/base')

const router = express.Router()

const userService = require('../services/user')
const votingService = require('../services/voting')

router.get('/', async (req, res) => {
    try {
        const votings = await votingService.getAllVotings()
        const response = votings.map(voting => {
            return {
                id: voting._id,
                name: voting.name,
                voteCount: voting.voteCount,
                createdAt: voting.createdAt,
                updatedAt: voting.updatedAt,
                description: voting.description
            }
        })
        res.json(BaseResponse.success(response))
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

    try {
        await votingService.deleteVotingById(id)
        res.json(BaseResponse.success())
    } catch (error) {
        res.json(BaseResponse.error(500, error.toString()))
    }
})

router.post('/', async (req, res) => {
    const user = await userService.findOneById(req.userId)
    const { name, description } = req.body

    try {
        await votingService.addNewVoting(user, name, description)
        res.json(BaseResponse.success())
    } catch (error) {
        res.json(BaseResponse.error(500, error.toString()))
    }
})

router.get('/vote', async (req, res) => {
    const user = await userService.findOneById(req.userId)
    const { id } = req.query

    try {
        await votingService.vote(user, id)
        res.json(BaseResponse.success())
    } catch (error) {
        res.json(BaseResponse.error(500, error.toString()))
    }
})

module.exports = router
