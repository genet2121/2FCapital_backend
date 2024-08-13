const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, condition, dependencies, smsService, type) {

    if(!authorization.can("read", "user")) {
        throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
    }

    return {whereQuery: condition, include: { bookUploads: true }};

}