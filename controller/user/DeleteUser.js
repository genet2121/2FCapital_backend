const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, id, dependencies, smsService) {

    try {

        if(!authorization.can("delete", "user")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        const userFound = await dependencies.databasePrisma.user.findFirst({
            where: { id: { in: id } }
        });

        if (!userFound.length == 0) {
            throw dependencies.exceptionHandling.throwError("user with " + id.join(", ") + " id does not exist", 404);
        }

        const user = await dependencies.databasePrisma.user.deleteMany({
            where: { id: { in: id } }
        });

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