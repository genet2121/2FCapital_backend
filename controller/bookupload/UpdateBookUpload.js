const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const Roles = require("../../Interface/Roles");
const BookUploadValidator = require("./bookUploadValidator");

module.exports = async function (reqUser, authorization, input, dependencies, smsService) {

    try {

        if(!authorization.can("update", "bookupload")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        // let validated = await dependencies.routingValidator.validatOnUpdateRecord("choice", input);
        let validated = ZodValidation(BookUploadValidator.update, input, dependencies);
        if (validated) {

            let condition = {id: input.id};

            if(!reqUser.Roles.includes(Roles.Admin)) {
                condition.owner_id = reqUser.Id;
            }

            let selected_questionaries = await dependencies.databasePrisma.basequestionary.findMany({
                where: {id: { in: input.questionaries }},
                select: {
                    question: true,
                    name: true,
                    type: true
                }
            });

            const foundRecord = await dependencies.databasePrisma.bookupload.findFirst({
                where: condition
            });

            if(!foundRecord) {
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

            const recordData = FieldsMapper.mapFields(input, "bookupload");
            let resultData = await dependencies.databasePrisma.bookupload.update({
                where: {
                    id: input.id
                },
                data: recordData,
            });

            await dependencies.databasePrisma.questionary.deleteMany({
                where: { upload_id: foundRecord.id }
            });

            await dependencies.databasePrisma.questionary.createMany({
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