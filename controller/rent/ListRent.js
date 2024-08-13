
module.exports = async function (reqUser, authorization, condition, dependencies, smsService, type) {

    return {whereQuery: condition, include: {
        owner: true,
        bookUploads: {
            include: {
                book: true
            }
        },
        additionalAnswer: true
    }};

}