const User = require('../models/user')
const Voting = require('../models/voting')

async function getAllUsers() {
    return await User.find({ deleted: false })
}

async function findOneById(id) {
    return await User.findOne({ _id: id, deleted: false })
}

async function findOneByUsername(username) {
    return await User.findOne({ username, deleted: false })
}

async function findOneByUsernameNotDeleted(username) {
    return await User.findOne({ username })
}

async function deleteUserById(id) {
    const user = await User.findOne({ _id: id })
    if (!user) {
        throw `User with ID ${id} does not exist`
    }

    if (user.votedFor !== null) {
        const voting = await Voting.findOne({ _id: user.votedFor })
        if (voting === null) {
            throw `Voting is null!`
        }

        voting.voteCount -= 1
        await voting.save()
    }

    user.deleted = true
    await user.save()

}

module.exports = {
    getAllUsers,
    findOneById,
    deleteUserById,
    findOneByUsername,
    findOneByUsernameNotDeleted
}
