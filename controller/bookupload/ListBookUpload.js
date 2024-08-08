
module.exports = async function (reqUser, authorization, condition, dependencies, smsService, type) {

    return {whereQuery: condition, include: { owner: true, book: true, rent: true, questionaries: true }};

}