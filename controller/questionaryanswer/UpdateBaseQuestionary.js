const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const BaseQuestionaryValidator = require("./QuestionaryAnswerValidator");

module.exports = async function (reqUser, authorization, input, dependencies, smsService) {

    try {

        // let validated = await dependencies.routingValidator.validatOnUpdateRecord("choice", input);
        let validated = ZodValidation(BaseQuestionaryValidator.create, input, dependencies);
        if (validated) {

            const foundRecord = await dependencies.databasePrisma.basequestionary.findFirst({
                where: {
                    id: input.id
                }
            });

            if(!foundRecord) {
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

            const recordData = FieldsMapper.mapFields(input, "basequestionary");
            return await dependencies.databasePrisma.basequestionary.update({
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