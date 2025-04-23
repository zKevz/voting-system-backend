const mongoose = require('mongoose')

const votingSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    voteCount: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Voting', votingSchema)
