const User = require('../models/user')
const Voting = require('../models/voting')

async function getAllVotings() {
    return await Voting.find({ deleted: false }).sort({ voteCount: 1 })
}

async function vote(user, id) {
    if (user.votedFor !== null) {
        throw 'This user already voted'
    }

    const voting = await Voting.findOne({ _id: id, deleted: false })
    if (!voting) {
        throw 'Voting with that ID does not exist'
    }

    voting.voteCount += 1
    await voting.save()

    user.votedFor = voting._id
    await user.save()
}

async function addNewVoting(user, name, description) {
    if (user.votedFor !== null) {
        throw 'This user already voted'
    }

    const existingVoting = await Voting.findOne({ name, deleted: false })
    if (existingVoting) {
        throw 'Voting with that name already exists'
    }

    const voting = new Voting({ name, description, voteCount: 1, deleted: false })
    await voting.save()

    user.votedFor = voting._id
    await user.save()
}

async function deleteVotingById(id) {
    const voting = await Voting.findOne({ _id: id })
    if (!voting) {
        throw `Voting with ID ${id} does not exist`
    }

    voting.deleted = true
    await voting.save()
    await User.updateMany({ votedFor: voting._id }, { $set: { votedFor: null } })
}

module.exports = {
    vote,
    getAllVotings,
    addNewVoting,
    deleteVotingById
}