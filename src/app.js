const dotenv = require('dotenv')
const express = require('express')
const cors = require('cors')

const v1 = require('./controllers/v1')
const jwt = require('./middlewares/jwt')
const BaseResponse = require('./response/base')

const app = express()
const port = 3000

dotenv.config()

app.use(cors())

app.use(express.json())

app.use(jwt)

app.use('/api/v1', v1)

app.use((_req, res, _next) => {
    return res.status(404).json(BaseResponse.error(404, 'Not Found'))
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

module.exports = app
