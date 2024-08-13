module.exports = async function (reqUser, authorization, id, dependencies, smsService, type) {
    try {

        if(!authorization.can("read", "book")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let condition = {id: Number(id)};
        if(!reqUser.Roles.includes(Roles.Admin)) {
            condition.owner_id = reqUser.Id
        }

        const book = await dependencies.databasePrisma.book.findUnique({
            where: condition
        })

        if (!book) {
            throw dependencies.exceptionHandling.throwError("No user exist with the given id", 404);
        }
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