const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

module.exports =  class SMSService {


    dependencies;
    constructor(dbs){
        this.dependencies = dbs;
    }
    
    getConfiguration() {
        return this.dependencies.smsConfiguration;
    }

     async sendSMS (phone, message) {

        try {
            let conf = this.getConfiguration();
        let data = new FormData();
        data.append('token', conf.smsToken);
        data.append('phone', phone);
        data.append('msg', message);
        // data.append('shortcode_id', conf.shortCodeId);

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: conf.url,
            headers: {
                ...data.getHeaders()
            },
            data: data
        };
            await axios(config);
        } catch(error){
            // console.log(error);
            if(error.statusCode){
                throw this.dependencies.exceptionHandling.throwError(error.message, error.statusCode);
            }else{
                throw this.dependencies.exceptionHandling.throwError(error.message, 500);
            }
        }

    }

    sendBulkSMS () {
        throw new Error("not implemented yet");
    }
};
