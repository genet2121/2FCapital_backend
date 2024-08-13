const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, id, dependencies, smsService) {

    try {

        if(!authorization.can("delete", "rent")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let condition = { id: { in: id } }
        if(!reqUser.Roles.includes(Roles.Admin)) {
            condition.owner_id = reqUser.Id;
        }

        const foundRecord = await dependencies.databasePrisma.rent.findFirst({
            where: condition
        });

        if (!foundRecord) {
            throw dependencies.exceptionHandling.throwError("record with " + id.join(", ") + " id does not exist", 404);
        }

        const result = await dependencies.databasePrisma.rent.deleteMany({
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