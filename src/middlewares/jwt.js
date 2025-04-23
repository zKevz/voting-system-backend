const jsonwebtoken = require('jsonwebtoken')
const BaseResponse = require('../response/base')

function jwt(req, res, next) {
    if (req.url.startsWith('/api/v1/auth')) {
        next()
        return
    }

    let token = req.header('Authorization')
    if (!token) {
        return res.json(BaseResponse.error(401, 'Unauthorized!'))
    }

    if (!token.startsWith('Bearer ')) {
        return res.json(BaseResponse.error(401, 'Unauthorized!'))
    }

    token = token.substring('Bearer '.length)

    try {
        const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY)
        req.role = decoded.role
        req.userId = decoded.userId
    } catch (error) {
        return res.status(200).json(BaseResponse.error(401, 'Invalid Token'))
    }

    next()
}

module.exports = jwt
