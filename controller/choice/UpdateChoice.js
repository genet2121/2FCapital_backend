const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const ChoiceValidator = require("./ChoiceValidator");
const Roles = require("../../Interface/Roles");


module.exports = async function (reqUser, authorization, input, dependencies, smsService) {

    try {

        if(!authorization.can("update", "choice")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        // let validated = await dependencies.routingValidator.validatOnUpdateRecord("choice", input);
        let validated = ZodValidation(ChoiceValidator.create, input, dependencies);
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