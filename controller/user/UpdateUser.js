const FieldsMapper = require("../../infrastructure/FieldMapper");

module.exports = async function (reqUser, input, dependencies, smsService) {

    try {

        let validated = await dependencies.routingValidator.validatOnUpdateRecord("user", input);

        if (validated) {

            const foundUser = await dependencies.databasePrisma.user.findFirst({
                where: {
                    id: input.id
                }
            });

            if(foundUser){
                if (reqUser.Roles.includes("admin") || foundUser.id == reqUser.id) {
                    if (input.password) {

                        input.password = await dependencies.encryption.hash(input.password);
                    }

                    const userData = FieldsMapper.mapFields(input, "user");

                    return await dependencies.databasePrisma.user.update({
                        where: {
                            id: input.id
                        },
                        data: userData,
                    });

                } else {
                    throw dependencies.exceptionHandling.throwError("Unauthorized access! Only the admin and the user owning the record can update it.", 401);
                }
            }else{
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }


        }


    } catch (error) {
        console.log(error);
        if(error.statusCode){
            throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }else{
            throw dependencies.exceptionHandling.throwError("Internal Server Error", 500);
        }
    }
}