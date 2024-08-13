const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const BaseQuestionaryValidator = require("./BaseQuestionaryValidator");
const Roles = require("../../Interface/Roles");

module.exports = async function (reqUser, authorization, data, dependencies, smsService) {

    try {

        // let validated = await dependencies.routingValidator.validateRecord("user", data);
        if(!authorization.can("create", "basequestionary")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let validated = ZodValidation( BaseQuestionaryValidator.create, data, dependencies);
        if (validated) {

            const recordData = FieldsMapper.mapFields(data, "basequestionary");
            recordData.created_by = reqUser.Id;

            let resultData = await dependencies.databasePrisma.basequestionary.create({
                data: recordData
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