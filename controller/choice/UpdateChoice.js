const FieldsMapper = require("../../infrastructure/FieldMapper");

module.exports = async function (reqUser, input, dependencies, smsService) {

    try {

        let validated = await dependencies.routingValidator.validatOnUpdateRecord("choice", input);
        if (validated) {

            const foundRecord = await dependencies.databasePrisma.choice.findFirst({
                where: {
                    id: input.id
                }
            });

            if(!foundRecord) {
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

            const recordData = FieldsMapper.mapFields(input, "choice");
            return await dependencies.databasePrisma.choice.update({
                where: {
                    id: input.id
                },
                data: recordData,
            });

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