const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const ChoiceValidator = require("./ChoiceValidator");
const Roles = require("../../Interface/Roles");


module.exports = async function (reqUser, authorization, data, dependencies, smsService) {

    try {

        if(!authorization.can("create", "choice")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        // let validated = await dependencies.routingValidator.validateRecord("user", data);
        let validated = ZodValidation( ChoiceValidator.create, data, dependencies);
        if (validated) {

            const choiceData = FieldsMapper.mapFields(data, "choice");

            let choice = await dependencies.databasePrisma.choice.create({
                data: choiceData
            });

            // await this.smsService.sendSMS(user.Phone, `Dear ${user.FullName} user your phone number to sign in to your account and the account password is ${password}. Thank you for working with us!`);

            return choice;

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