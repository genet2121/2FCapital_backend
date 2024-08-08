const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const BookUploadValidator = require("./bookUploadValidator");

module.exports = async function (reqUser, authorization, data, dependencies, smsService) {

    try {

        // let validated = await dependencies.routingValidator.validateRecord("user", data);
        let validated = ZodValidation( BookUploadValidator.create, data, dependencies);
        if (validated) {

            let selected_questionaries = await dependencies.databasePrisma.basequestionary.findMany({
                where: {id: { in: data.questionaries }},
                select: {
                    question: true,
                    name: true,
                    type: true
                }
            });

            const recordData = FieldsMapper.mapFields(data, "bookupload");

            let resultData = await dependencies.databasePrisma.bookupload.create({
                data: recordData
            });

            await dependencies.databasePrisma.questionary.crateMany({
                data: selected_questionaries.map(sq => ({ ...sq, upload_id: resultData.id }))
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