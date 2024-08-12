
const fs = require('fs');
const path = require('path');

module.exports = class attachmentController {

    dependencies;

    constructor(deps) {
        this.dependencies = deps;
    }

    async handleFileUpload(dependencies, name, table, record, file) {
        try {

            if (!file.originalFilename) {
                throw this.dependencies.exceptionHandling.throwError("File Name not found", 400);
            }

            const fileNameArray = file.originalFilename?.split(".");

            if (fileNameArray?.length < 2) {
                throw this.dependencies.exceptionHandling.throwError("Could not extract file extension!", 400);
            }

            let directory = dependencies.attachmentDirectory;

            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory);
            }

            const extension = file.originalFilename.split(".").pop();

            let current_date_time = new Date().getTime();
            let customFileName = `${table}_${record}_${current_date_time}.${extension}`;
            let validated = await this.dependencies.routingValidator.validateRecord("attachment", { name, table, record, file_name: customFileName });

            if (validated) {
                const attachment = await dependencies.databasePrisma.attachment.create({
                    data: {
                        name: name,
                        table: table,
                        record: parseInt(record),
                        file_name: customFileName,
                        extension: extension
                    }
                });

                const filePath = path.join(directory, customFileName);
                fs.renameSync(file.filepath, filePath);
                return attachment;
            }

        } catch (error) {
            console.log(error);
            throw this.dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }

    }

}