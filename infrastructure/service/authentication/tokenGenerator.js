

const jwt = require('jsonwebtoken');

module.exports = class TokenGenerator {
    
    constructor(){

    }

    generate(payload, secretId){
        const token = jwt.sign(payload, secretId);
        return token;
    }

    verify(token, secretId){
        try{
            const data = jwt.verify(token, secretId);
            return data;
        }catch(error){
            
        }
    }
}  