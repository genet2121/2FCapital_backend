const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, id, dependencies, smsService) {

    try {

        if(!authorization.can("delete", "book")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let condition = {id: { in: { in: parseInt(id) } },};
        if(!reqUser.Roles.includes(Roles.Admin)) {
            condition = {
                owner_id: reqUser.Id
            };
        }

        const bookFound = await dependencies.databasePrisma.book.findFirst({
            where: condition
        });

        if (!bookFound) {
            throw dependencies.exceptionHandling.throwError("user with " + id.join(", ") + " id does not exist", 404);
        }

        const book = await dependencies.databasePrisma.book.deleteMany({
            where: condition
        });

        return book;

    } catch (error) {

        console.log(error);

        if(error.statusCode){
            throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }else{
            throw dependencies.exceptionHandling.throwError("Internal Server Error", 500);
        }

    }

}