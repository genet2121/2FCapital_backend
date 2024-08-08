module.exports = async function (reqUser, authorization, id, dependencies, smsService) {

    try {

        const bookFound = await dependencies.databasePrisma.book.findFirst({
            where: { id: { in: id } }
        });

        if (!bookFound) {
            throw dependencies.exceptionHandling.throwError("user with " + id.join(", ") + " id does not exist", 404);
        }

        const book = await dependencies.databasePrisma.book.deleteMany({
            where: { id: { in: id } }
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