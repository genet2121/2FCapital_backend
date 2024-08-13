const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const RentValdator = require("./rentValidator");
const Roles = require("../../Interface/Roles");


module.exports = async function (reqUser, authorization, input, dependencies, smsService) {

    try {

        if(!authorization.can("update", "rent")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let condition_record = {id: input.id};
        if(!reqUser.Roles.includes(Roles.Admin)) {
            condition_record.owner_id = reqUser.Id;
        }

        // let validated = await dependencies.routingValidator.validatOnUpdateRecord("choice", input);
        let validated = ZodValidation(RentValdator.update, input, dependencies);
        if (validated) {

            const found_book_upload = await dependencies.databasePrisma.bookupload.findFirst({
                where: {id: input.upload_id},
                include: {
                    questionaries: true
                }
            });

            if(!found_book_upload) {
                throw dependencies.exceptionHandling.throwError("book upload not found", 500);
            }

            found_book_upload.questionaries.forEach(qnr => {
                let found_ans = input.answers.find(ans => ans.id == qnr.id);
                if(!found_ans) {
                    throw dependencies.exceptionHandling.throwError(`questionary named ${qnr.question} is missing`, 500);
                }
            });

            const foundRecord = await dependencies.databasePrisma.rent.findFirst({
                where: condition_record
            });

            if(!foundRecord) {
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

            const recordData = FieldsMapper.mapFields(input, "rent");
            const changes = FieldsMapper.identifyChanges(foundRecord, recordData);
            recordData.owner_id = reqUser.Id;

            let resultData = await dependencies.databasePrisma.rent.update({
                where: {
                    id: input.id
                },
                data: recordData,
            });

            await dependencies.databasePrisma.questionanswer.deleteMany({
                where: { rent_id: input.id }
            });

            await dependencies.databasePrisma.questionanswer.createMany({
                data: input.answers.map(ans => ({question_id: ans.id, answer: ans.answer, rent_id: resultData.id }))
            });

            if(recordData.status == "returned" && changes.filter(cng => (cng.column == "status")).length > 0) {
                await dependencies.databasePrisma.bookupload.update({
                    where: {id: found_book_upload.id},
                    data: {
                        quantity: found_book_upload.quantity + input.quantity
                    }
                });
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