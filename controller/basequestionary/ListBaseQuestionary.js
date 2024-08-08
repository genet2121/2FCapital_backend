
module.exports = async function (reqUser, authorization, condition, dependencies, smsService, type) {

    return {whereQuery: condition, include: { owner: true }};

}