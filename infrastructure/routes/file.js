const fs = require('fs');
const path = require('path');

const express = require("express");
const formidable = require('formidable');


const fileRepoController = require("../../controller/fileRepo/fileRepo");

const FileUploadService = require("../service/FileUpload/fileUploadService");


// const router = myRouter()
const { PrismaClient } = require('@prisma/client');

const prisma = require("@prisma/client");


module.exports = (dependencies) => {

    const fileController = new fileRepoController(dependencies);
    const router = express.Router();

    router.post("/upload", async (req, res, next) => {
        var form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
            try {

                if (!fields.table) {
                    throw dependencies.exceptionHandling.throwError("form body must contain table property", 400);
                }

                if (!fields.name) {
                    throw dependencies.exceptionHandling.throwError("form body must contain a name property", 400);
                }

                if (!fields.record) {
                    throw dependencies.exceptionHandling.throwError("form body must contain a record", 400);
                }

                if (!files.file) {
                    throw dependencies.exceptionHandling.throwError("form body must contain a file", 400);
                }
                
                let model = await prisma.Prisma.ModelName[fields.table[0]];

                if (!model) {
                    throw dependencies.exceptionHandling.throwError("table not found", 404);
                }

                let new_file = await fileController.handleFileUpload(dependencies, fields.name[0], fields.table[0], fields.record[0], files.file[0]);

                return res.status(200).json(new_file);

            } catch (error) {
                console.log(error);
                if(error.statusCode){
                    return res.status(error.statusCode).json({ message: error.message })
                }else{
                    return res.status(500).json({ message: "Internal Server Error" })
                }
            }
        });
    });

    router.get("/:id", async (req, res, next) => {

        try {

            let fileId = req.params.id;
            fileId = Number(fileId);
            if (!fileId) {
                throw dependencies.exceptionHandling.throwError("request params must contain id property", 400);
            }

            const directoryPath = dependencies.attachmentDirectory;

            const foundFile = await dependencies.databasePrisma.attachment.findFirst({
                where: {
                    id: Number(req.params.id)
                }
            });

            if(!foundFile){
                return res.status(404).json({ message: `File with the Id ${req.params.id} not found` })
            }
            
            if (!fs.existsSync(path.join(directoryPath, foundFile.file_name))) {
                return res.status(404).json({ message: `File attachment is corrupted.` })
            }

            let filePath = path.join(directoryPath, foundFile.file_name);

            res.sendFile(filePath, {
                headers: {
                    'Content-Disposition': `attachment; filename="${foundFile.file_name}"`,
                    'Content-Type': `application/${foundFile.extension}`
                }
            });

        } catch (error) {
            if(error.statusCode){
                return res.status(error.statusCode).json({ message: error.message })
            }else{
                return res.status(500).json({ message: "Internal Server Error" })
            }
        }

    });

    return router;

}

