module.exports = async function (reqUser, authorization, id, dependencies, smsService, type) {
    try {

        const book = await dependencies.databasePrisma.book.findUnique({
            where: {
                id: Number(id)
            }
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