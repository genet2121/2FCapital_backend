const formidable = require("formidable");
// import ConfigurationService from "./ConfigurationService";

const fs = require('fs');

module.exports = class FileUploadService {

    //  AllConfiguration: {
    //     category,
    //     parameters: {
    //         sizeLimit,
    //         fileTypes,
    //     }
    // };
     CurrentId;
     MainFilePath;
     configService;

    constructor(conf) {
        // this.configService = conf;
        // this.AllConfiguration = conf.getConfiguration("fileUploadConfigurations");
        // this.CurrentId = conf.getConfiguration("fileUploadId");
        // this.MainFilePath = conf.getConfiguration("uploadFolder");
    }

    updateFileId() {
        this.configService.setConfiguration("fileUploadId", this.CurrentId + 1);
    }

    handleFileUpload(name, table, file){

        
        
        // let config = this.AllConfiguration.find(c => (c.category == de.toLowerCase()));

        if (!config) {
            throw new Error(`Unknown file upload type of ${category} `);
        }

        if (file.size > config.parameters.sizeLimit) {
            throw new Error("File upload size is over the permitted size");
        }

        if (!file.originalFilename) {
            throw new Error("File Name not found");
        }

        const fileNameArray = file.originalFilename?.split(".");

        if (fileNameArray?.length < 2) {
            throw new Error("Could not extract file extension!");
        }

        const fileType = fileNameArray[fileNameArray.length - 1];
        const fileName = `file_${category.toLowerCase()}_${this.CurrentId}.${fileType}`;
        const newFilePath = `${this.MainFilePath}/${fileName}`;

        // if(fs.existsSync(newFilePath)) {
            
        // }
        fs.renameSync(file.filepath, newFilePath);
        this.updateFileId();

        return fileName;

    }
    // handleFileUpload(category, file){

    //     let config = this.AllConfiguration.find(c => (c.category == de.toLowerCase()));

    //     if (!config) {
    //         throw new Error(`Unknown file upload type of ${category} `);
    //     }

    //     if (file.size > config.parameters.sizeLimit) {
    //         throw new Error("File upload size is over the permitted size");
    //     }

    //     if (!file.originalFilename) {
    //         throw new Error("File Name not found");
    //     }

    //     const fileNameArray = file.originalFilename?.split(".");

    //     if (fileNameArray?.length < 2) {
    //         throw new Error("Could not extract file extension!");
    //     }

    //     const fileType = fileNameArray[fileNameArray.length - 1];
    //     const fileName = `file_${category.toLowerCase()}_${this.CurrentId}.${fileType}`;
    //     const newFilePath = `${this.MainFilePath}/${fileName}`;

    //     // if(fs.existsSync(newFilePath)) {
            
    //     // }
    //     fs.renameSync(file.filepath, newFilePath);
    //     this.updateFileId();

    //     return fileName;

    // }

    getFileAddress() {
        return this.MainFilePath;
    }

};