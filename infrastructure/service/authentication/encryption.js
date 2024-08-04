

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = class Encryption {
     
    constructor(){

    }

    async hash(password){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }

    async compare(password, hashedPassword){
        try{

           const userHash = await bcrypt.compare(password, hashedPassword);
           if(userHash){
               return true;
           }     
           if(!userHash){
               return false;
           }
       }catch(error){
        console.log(error);
       }

    }


}