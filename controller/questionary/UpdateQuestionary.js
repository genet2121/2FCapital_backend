const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const QuestionaryValidator = require("./QuestionaryValidator");
const Roles = require("../../Interface/Roles");


module.exports = async function (reqUser, authorization, input, dependencies, smsService) {

    try {

        if(!authorization.can("update", "questionary")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        // let validated = await dependencies.routingValidator.validatOnUpdateRecord("choice", input);
        let validated = ZodValidation(QuestionaryValidator.create, input, dependencies);
        if (validated) {

            const foundRecord = await dependencies.databasePrisma.questionary.findFirst({
                where: {
                    id: input.id
                }
            });

            if(!foundRecord) {
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

            const recordData = FieldsMapper.mapFields(input, "questionary");
            return await dependencies.databasePrisma.questionary.update({
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