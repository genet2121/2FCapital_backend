const FieldsMapper = require("../../infrastructure/FieldMapper");

module.exports = async function (reqUser, data, dependencies, smsService) {

    try {

        // let validated = await dependencies.routingValidator.validateRecord("user", data);
        let validated = ZodValidation(BookValidator.create, data, dependencies);
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