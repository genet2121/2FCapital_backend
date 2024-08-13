const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const RentValidator = require("./rentValidator");

module.exports = async function (reqUser, authorization, data, dependencies, smsService) {

    try {

        // let validated = await dependencies.routingValidator.validateRecord("user", data);
        let validated = ZodValidation( RentValidator.create, data, dependencies);
        if (validated) {

            const found_book_upload = await dependencies.databasePrisma.bookupload.findFirst({
                where: {
                    id: data.upload_id,
                    owner_id: 4
                },
                include: {
                    questionaries: true
                }
            });

            if(!found_book_upload) {
                throw dependencies.exceptionHandling.throwError("book upload not found", 500);
            }

            found_book_upload.questionaries.forEach(qnr => {
                let found_ans = data.answers.find(ans => ans.id == qnr.id);
                if(!found_ans) {
                    throw dependencies.exceptionHandling.throwError(`questionary named ${qnr.question} is missing`, 500);
                }
            });

            const recordData = FieldsMapper.mapFields(data, "rent");
            recordData.date = new Date().toISOString();
            recordData.owner_id = 4;

            let resultData = await dependencies.databasePrisma.rent.create({
                data: recordData
            });

            await dependencies.databasePrisma.questionanswer.createMany({
                data: data.answers.map(ans => ({question_id: ans.id, answer: ans.answer, rent_id: resultData.id }))
            });

            // await this.smsService.sendSMS(user.Phone, `Dear ${user.FullName} user your phone number to sign in to your account and the account password is ${password}. Thank you for working with us!`);

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