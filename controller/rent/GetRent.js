module.exports = async function (reqUser, authorization, id, dependencies, smsService, type) {
    try {

        if(!authorization.can("read", "rent")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let condition = { id: Number(id) }
        if(!reqUser.Roles.includes(Roles.Admin)) {
            condition.owner_id = reqUser.Id;
        }

        const foundRecord = await dependencies.databasePrisma.rent.findUnique({
            where: condition,
            include: {
                owner: true,
                bookUploads: true,
                additionalAnswer: true
            }
        });

        if (!foundRecord) {
            throw dependencies.exceptionHandling.throwError("No rent exist with the given id", 404);
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