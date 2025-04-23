const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        required: true
    },
    votedFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voting',
        default: null
    },
    deleted: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)
