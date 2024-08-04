
module.exports = class Exception extends Error {

     static language = "eng";

     static allMessages= {
        auth0001: {
            eng: "user not found።",
            amh: "ተጠቃሚው አልተገኘም።"
        },
        auth0002: {
            eng: "old password does not match።",
            amh: "የበፊት ይለፍ ቃል ትክክል አይደለም።"
        },
        auth0003: {
            eng: "incorrect password።",
            amh: "የይለፍ ቃል ትክክል አይደለም።"
        },
        db0001: {
            eng: "Unkown error! we are working on it።",
            amh: "የማይታወቅ ችግር ተፈጥሯል። በመፈታት ላይ ይገኛል።"
        },
        user0001: {
            eng: "Unknown userId።",
            amh: "የማይታወቅ ተጠቃሚ መለያ አስገብተዋል።"
        },
        user0002: {
            eng: "User already exist with same email address, please insert another።",
            amh: "ይህ የኢሜይል አድራሻ በሌላ ተጠቃሚ ተመዝግቧል፣ እባክዎ ሌላ ያስገቡ።"
        },
        user0003: {
            eng: "Password doesnot match።",
            amh: "ያስገቡት የይለፍ ቃል ተመሳሳይ አደለም፣ እባክዎ ተመሳሳይ የይለፍ ቃል ያስገቡ።"
        },
        user0004: {
            eng: "fill all the required fields።",
            amh: "ሁሉንም አስፈላጊ መቀበያዎች ያስገቡ።"
        },
        img0001: {
            eng: "Error saving image።",
            amh: "ምስል ማስቀመጥ ላይ ስህተት ተፈጥሯል።"
        },
        img0002: {
            eng: "Error reading the image file።",
            amh: "የምስሉን ፋይል በማንበብ ላይ ስህተት ተፈጥሯል።"
        },
        

    };

    constructor(exception_id) {
        super(Exception.allMessages[exception_id][Exception.language]);
    }

    static changeLanguage(lang){
        Exception.language = lang;
    }


}