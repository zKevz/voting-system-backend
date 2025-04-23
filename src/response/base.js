class BaseResponse {
    constructor(data = null, code = 200, message = 'OK') {
        this.data = data
        this.code = code
        this.message = message
    }

    static success(data) {
        return new BaseResponse(data, 200, 'OK')
    }

    static error(code, message) {
        return new BaseResponse(null, code, message)
    }
}

module.exports = BaseResponse
