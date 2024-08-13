const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, condition, dependencies, smsService, type) {

    if(!authorization.can("read", "bookupload")) {
        throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
    }

    if(!reqUser.Roles.includes(Roles.Admin)) {
        condition.owner_id = reqUser.Id;
    }

    return {whereQuery: condition, include: { owner: true, book: true, questionaries: true }};

}