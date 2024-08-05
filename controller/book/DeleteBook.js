module.exports = async function (reqUser, id, dependencies, smsService) {

    try {

        const userFound = await dependencies.databasePrisma.user.findFirst({
            where: { id: id }
        });
        if (!userFound) {
            throw dependencies.exceptionHandling.throwError("user with " + id + " id does not exist", 404);
        }
        const user = await dependencies.databasePrisma.user.delete({
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