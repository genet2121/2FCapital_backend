const express = require("express");
const AuthController = require("../../controller/auth/auth");
const AuthService = require("../service/authentication/auth");
const SMSService = require("../../infrastructure/service/SMS/SMSservice");

// const router = myRouter()
// const { PrismaClient } = require('@prisma/client');
// const prisma = require("@prisma/client");


module.exports = (dependencies) => {

    const authController = new AuthController(dependencies);
    var smsService = new SMSService(dependencies); 
    const router = express.Router();


    router.post("/login", async (req, res, next) => {

        try {

            let {email, password} =  req.body;
            if(!email || !password) {
                throw dependencies.exceptionHandling.throwError("request Body must have phone and password", 400);
            }
            const authresult = await authController.login({email, password});

            return res.status(200).json(authresult);

        } catch(error) {

            console.log(error);
            if(error.statusCode){
                return res.status(error.statusCode).json({ message: error.message })
            }else{
                return res.status(500).json({ message: "Internal Server Error" })
            }

        }

    });

    router.get("/logout", async (req, res, next) => {

        try {

            req.user = null;
            return res.json("logout success");

        } catch(error) {

            console.log(error);
            if(error.statusCode){
                return res.status(error.statusCode).json({ message: error.message })
            }else{
                return res.status(500).json({ message: "Internal Server Error" })
            }

        }

    });

    router.post("/password_reset", AuthService.authenticate, async (req, res, next) => {

        try{

            if(!req.user.Roles.includes("admin")) {
                throw dependencies.exceptionHandling.throwError("Unauthorized access! only admins can reset account password! contact your administrator.", 400);
            }

            let {Phone} =  req.body

            if(!Phone || Phone.length < 9) {
                throw dependencies.exceptionHandling.throwError("request Body must have phone property and it should be correct phone", 400);
            }

            if(Phone.charAt(0) == "+") {
                new_phone = Phone.substring(4);
            } else if(Phone.charAt(0) == "0") {
                new_phone = Phone.substring(1);
            }else {
                new_phone = Phone;
            }

            const userFind = await dependencies.databasePrisma.user.findFirst({
                where: {
                      Phone: {contains: new_phone},
                }
            });

            if(!userFind){
                throw dependencies.exceptionHandling.throwError(`user with the ${Phone} phone  number not found`, 400);
            }

            const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
            const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const numberChars = '0123456789';
        
            const allChars = lowercaseChars + uppercaseChars + numberChars;

            // let password = 'password';
            let password = '';
            password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
            password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
            password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));

            for (let i = 4; i < 7; i++) {
                password += allChars.charAt(Math.floor(Math.random() * allChars.length));
            }


            // var userData = {};
            password = password.split('').sort(() => Math.random() - 0.5).join('');
            userFind.Password = await dependencies.encryption.hash(password);

            const userUpdate = await dependencies.databasePrisma.user.update({
                where: {
                    id: userFind.id,
                },
                data: userFind
            });

            await smsService.sendSMS("0"+new_phone, `Dear ${userFind.FullName}, your account password has been reset to ${password}`);
            return res.status(200).json({"New Password": password});

        } catch (error) {
            console.log(error);
            if (error.statusCode) {
                return res.status(error.statusCode).json({ message: error.message })
            } else {
                return res.status(500).json({ message: "Internal Server Error" })
            }
        }

    });

    router.get("/authorize", async (req, res, next) => {
        try{
            if(!req.headers.authorization){
                throw dependencies.exceptionHandling.throwError("token not Given", 400);
            }

            const token = req.headers.authorization.split(" ")[1];
  
            let user = await dependencies.tokenGenerator.verify(token, dependencies.appSecretKey);/* as JwtPayload*/;
            if(!user){
                throw dependencies.exceptionHandling.throwError("Invalid Token", 401);
            }
            return res.status(200).json({
                Token: token,
                ...user
            });

        }catch(error) {
            console.log(error);
            if(error.statusCode){
                return res.status(error.statusCode).json({ message: error.message })
            }else{
                return res.status(500).json({ message: "Internal Server Error" })
            }
        }
    });
   
    return router;

}

