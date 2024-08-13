module.exports = async function (reqUser, authorization, id, dependencies, smsService, type) {
    try {

        const foundRecord = await dependencies.databasePrisma.bookupload.findUnique({
            where: {
                id: parseInt(id)
            }, 
            include: {
                questionaries: true,
                book: true,
                owner: true
            }
        });

        if (!foundRecord) {
            throw dependencies.exceptionHandling.throwError("No base bookupload exist with the given id", 404);
        }

        return foundRecord;

    } catch (error) {
        console.log(error);
        if(error.statusCode){
            throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }else{
            throw dependencies.exceptionHandling.throwError("Internal Server Error", 500);
        }
    }
}