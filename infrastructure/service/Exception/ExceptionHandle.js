

module.exports = class ExceptionHandle {

    constructor() {

    }

    throwError(message, statusCode) {
        // console.log(message);
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    }

}