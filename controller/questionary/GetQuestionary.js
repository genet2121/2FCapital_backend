module.exports = async function (reqUser, authorization, id, dependencies, smsService, type) {
    try {

        const foundRecord = await dependencies.databasePrisma.questionary.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!foundRecord) {
            throw dependencies.exceptionHandling.throwError("No questionary exist with the given id", 404);
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