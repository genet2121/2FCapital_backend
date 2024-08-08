const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, condition, dependencies, smsService, type) {

    if(!reqUser.Roles.includes(Roles.Admin)) {
        condition.created_by = reqUser.Id;
    }

    return {whereQuery: condition, include: { owner: true }};

}