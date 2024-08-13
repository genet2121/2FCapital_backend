const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, id, dependencies, smsService, type) {
    try {

        if(!authorization.can("read", "user")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let condition = {
            id: Number(id)
        };

        if(!reqUser.Roles.includes(Roles.Admin)) {
            condition.id = reqUser.id;
        }

        const user = await dependencies.databasePrisma.user.findUnique({
            where: condition
        });

        if (!user) {
            throw dependencies.exceptionHandling.throwError("No user exist with the given id", 404);
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