const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const RentValdator = require("./rentValidator");

module.exports = async function (reqUser, authorization, input, dependencies, smsService) {

    try {

        // let validated = await dependencies.routingValidator.validatOnUpdateRecord("choice", input);
        let validated = ZodValidation(RentValdator.create, input, dependencies);
        if (validated) {

            const foundRecord = await dependencies.databasePrisma.rent.findFirst({
                where: {
                    id: input.id
                }
            });

            if(!foundRecord) {
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

            const recordData = FieldsMapper.mapFields(input, "rent");
            return await dependencies.databasePrisma.bookupload.update({
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