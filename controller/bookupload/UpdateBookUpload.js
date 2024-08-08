const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const BookUploadValidator = require("./bookUploadValidator");

module.exports = async function (reqUser, authorization, input, dependencies, smsService) {

    try {

        // let validated = await dependencies.routingValidator.validatOnUpdateRecord("choice", input);
        let validated = ZodValidation(BookUploadValidator.create, input, dependencies);
        if (validated) {

            let selected_questionaries = await dependencies.databasePrisma.basequestionary.findMany({
                where: {id: { in: data.questionaries }},
                select: {
                    question: true,
                    name: true,
                    type: true
                }
            });

            const foundRecord = await dependencies.databasePrisma.bookupload.findFirst({
                where: {
                    id: input.id
                }
            });

            if(!foundRecord) {
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

            const recordData = FieldsMapper.mapFields(input, "basequestionary");
            let resultData = await dependencies.databasePrisma.bookupload.update({
                where: {
                    id: input.id
                },
                data: recordData,
            });

            await dependencies.databasePrisma.questionary.deleteMany({
                where: { upload_id: foundRecord.id }
            });

            await dependencies.databasePrisma.questionary.crateMany({
                data: selected_questionaries.map(sq => ({ ...sq, upload_id: foundRecord.id }))
            });

            return resultData;

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