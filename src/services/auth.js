const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const userService = require('../services/user')

const jwtOptions = { expiresIn: '7d' }

function validateUsername(username) {
    if (typeof username !== 'string') {
        throw 'Username must be a string'
    }

    if (username.length < 3 || username.length > 20) {
        throw 'Username must be between 3 and 20 characters'
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw 'Username can only contain letters, numbers, and underscores'
    }
}

function validatePassword(password) {
    if (typeof password !== 'string') {
        throw 'Password must be a string'
    }

    if (password.length < 8) {
        throw 'Password must be at least 8 characters'
    }
}

async function onRegister(username, password) {
    validateUsername(username)
    validatePassword(password)

    const existingUser = await userService.findOneByUsernameNotDeleted(username)
    if (existingUser) {
        throw 'User with that username already exists'
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const role = username.toLowerCase() === 'admin' ? 'admin' : 'user'
    const user = new User({ username, password: hashedPassword, role, deleted: false })
    await user.save()

    const data = {
        role: user.role,
        userId: user._id
    }

    const token = jwt.sign(data, process.env.SECRET_KEY, jwtOptions)
    return token
}

async function onLogin(username, password) {
    validateUsername(username)
    validatePassword(password)

    const user = await userService.findOneByUsername(username)
    if (!user) {
        throw 'Username or password not found'
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
        throw 'Username or password not found'
    }

    const data = {
        role: user.role,
        userId: user._id
    }

    const token = jwt.sign(data, process.env.SECRET_KEY, jwtOptions)
    return token
}

module.exports = {
    onRegister,
    onLogin
}
