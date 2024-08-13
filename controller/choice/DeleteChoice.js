const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, id, dependencies, smsService) {

    try {

        if(!authorization.can("delete", "choice")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        const foundRecord = await dependencies.databasePrisma.choice.findFirst({
            where: { id: { in: id } }
        });

        if (!foundRecord) {
            throw dependencies.exceptionHandling.throwError("record with " + id.join(", ") + " id does not exist", 404);
        }

        const result = await dependencies.databasePrisma.choice.deleteMany({
            where: { id: { in: id } }
        });

        return result;

    } catch (error) {
        console.log(error);

        if(error.statusCode){
            throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }else{
            throw dependencies.exceptionHandling.throwError("Internal Server Error", 500);
        }
    }

}