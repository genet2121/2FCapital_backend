const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, id, dependencies, smsService, type) {
    try {

        if(!authorization.can("read", "basequestionary")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let condition = { id: parseInt(id) };
        if(!reqUser.Roles.includes(Roles.Admin)) {
            condition.created_by = reqUser.Id
        }

        const foundRecord = await dependencies.databasePrisma.basequestionary.findUnique({
            where: condition
        });

        if (!foundRecord) {
            throw dependencies.exceptionHandling.throwError("No base questionary exist with the given id", 404);
        }

        class basequesionary {
            created_by;
            constructor(creator){
                this.created_by = creator;
            }
        };

        if(!authorization.can("read", basequesionary(foundRecord.created_by))) {
            throw dependencies.exceptionHandling.throwError("you are not allowed to read the record", 403);
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