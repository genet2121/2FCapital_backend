const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, id, dependencies, smsService, type) {
    try {

        if(!authorization.can("get", "choice")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        const user = await dependencies.databasePrisma.choice.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!user) {
            throw dependencies.exceptionHandling.throwError("No choice exist with the given id", 404);
        }
        return user;
    } catch (error) {
        console.log(error);
        if(error.statusCode){
            throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }else{
            throw dependencies.exceptionHandling.throwError("Internal Server Error", 500);
        }
    }
}