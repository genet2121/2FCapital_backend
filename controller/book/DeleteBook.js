module.exports = async function (reqUser, id, dependencies, smsService) {

    try {

        const bookFound = await dependencies.databasePrisma.book.findFirst({
            where: { id: id }
        });
        if (!bookFound) {
            throw dependencies.exceptionHandling.throwError("user with " + id + " id does not exist", 404);
        }
        const book = await dependencies.databasePrisma.book.delete({
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