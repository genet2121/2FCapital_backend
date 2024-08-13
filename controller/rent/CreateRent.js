const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const RentValidator = require("./rentValidator");
const Roles = require("../../Interface/Roles");


module.exports = async function (reqUser, authorization, data, dependencies, smsService) {

    try {

        if(!authorization.can("create", "rent")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        // let validated = await dependencies.routingValidator.validateRecord("user", data);
        let validated = ZodValidation( RentValidator.create, data, dependencies);
        if (validated) {

            const found_book_upload = await dependencies.databasePrisma.bookupload.findFirst({
                where: {
                    id: data.upload_id,
                    owner_id: reqUser.Id
                },
                include: {
                    questionaries: true
                }
            });

            if(!found_book_upload) {
                throw dependencies.exceptionHandling.throwError("book upload not found", 500);
            }
            
            if(found_book_upload.quantity < data.quantity) {
                throw dependencies.exceptionHandling.throwError("there is no ehough book copies to rent!", 500);
            }

            found_book_upload.questionaries.forEach(qnr => {
                let found_ans = data.answers.find(ans => ans.id == qnr.id);
                if(!found_ans) {
                    throw dependencies.exceptionHandling.throwError(`questionary named ${qnr.question} is missing`, 500);
                }
            });

            const recordData = FieldsMapper.mapFields(data, "rent");
            recordData.date = new Date().toISOString();
            recordData.owner_id = reqUser.Id;

            let resultData = await dependencies.databasePrisma.rent.create({
                data: recordData
            });

            await dependencies.databasePrisma.questionanswer.createMany({
                data: data.answers.map(ans => ({question_id: ans.id, answer: ans.answer, rent_id: resultData.id }))
            });

            await dependencies.databasePrisma.bookupload.update({
                where: {id: found_book_upload.id},
                data: {
                    quantity: found_book_upload.quantity - data.quantity
                }
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