const FieldsMapper = require("../../infrastructure/FieldMapper");

module.exports = async function (reqUser, data, dependencies, smsService) {
    try {

        // let validated = await dependencies.routingValidator.validateRecord("user", data);
        // if (validated) {

            
            // const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
            // const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            // const numberChars = '0123456789';
            // const specialChars = '!@#$%^&*()-_=+[{]}|;:,<.>/?';
        
            // const allChars = lowercaseChars + uppercaseChars + numberChars + specialChars;
        
            // // let password = 'password';
            // let password = '';
            // password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
            // password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
            // password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
            // password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

            // for (let i = 0; i < 4; i++) {
            //     password += allChars.charAt(Math.floor(Math.random() * allChars.length));
            // }
        

            // // password = password.split('').sort(() => Math.random() - 0.5).join('');
            // data.Password = await dependencies.encryption.hash(password);
            
            // const userData = new UserEntity(data);
            const userData = FieldsMapper.mapFields(data, "user");

            let user = await dependencies.databasePrisma.user.create({
                data: userData
            });

            // user.Password = password;

            // await this.smsService.sendSMS(user.Phone, `Dear ${user.FullName} user your phone number to sign in to your account and the account password is ${password}. Thank you for working with us!`);

            return user;
        // }

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