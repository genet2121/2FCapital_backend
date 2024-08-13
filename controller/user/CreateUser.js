const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const UserValidator = require("./UserValidator");
const Roles = require("../../Interface/Roles");


module.exports = async function (reqUser, authorization, data, dependencies, smsService) {
    try {

        if(!authorization.can("create", "user")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        // let validated = await dependencies.routingValidator.validateRecord("user", data);
        let validated = ZodValidation(UserValidator.create, data, dependencies);
        if (validated) {

            data.Approved = "false";

            if(!data.Status) {
                data.Status = "false";
            }
            data.password = await dependencies.encryption.hash(data.password);
            
            // const userData = new UserEntity(data);
            const userData = FieldsMapper.mapFields(data, "user");

            if(reqUser.Id == 0) {
                userData.Status = "false",
                userData.type = "owner"
            }

            let user = await dependencies.databasePrisma.user.create({
                data: userData
            });

            // await this.smsService.sendSMS(user.Phone, `Dear ${user.FullName} user your phone number to sign in to your account and the account password is ${password}. Thank you for working with us!`);

            return user;
        }

    }
    catch (error) {
        console.log(error);

        if(error.statusCode){
            throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }else{
            throw dependencies.exceptionHandling.throwError("Internal Server Error", 500);
        }
    }
}