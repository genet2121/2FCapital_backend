
module.exports = async function (reqUser, authorization, condition, dependencies, smsService, type) {

    if(!authorization.can("read", "bookupload")) {
        condition.owner_id = reqUser.Id;
    }

    return {whereQuery: condition, include: { owner: true, book: true, rent: true, questionaries: true }};

}