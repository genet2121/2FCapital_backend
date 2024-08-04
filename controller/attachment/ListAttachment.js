module.exports = async function (reqUser, condition, dependencies, smsService, type) {

    return {whereQuery: condition, include: {}};

}