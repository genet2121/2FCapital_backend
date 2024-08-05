const express = require("express");
const Controller = require("../../controller/controllers");
const AuthService = require("../service/authentication/auth");
const prisma = require("@prisma/client");
const SMSService = require("../service/SMS/SMSservice");
const ChangePassword = require("../../controller/user/ChangePassword");

module.exports = class Crud {

    dependencies;
    router;
    smsService;

    constructor(deps) {
        this.dependencies = deps;
        this.router = express.Router();
        this.smsService = new SMSService(deps);
    }

    getRoute() {

        const controllers = Controller(this.dependencies);

        this.router.post("/create", async (req, res, next) => {

            try {

                if (!req.body.tableName) {
                    throw this.dependencies.exceptionHandling.throwError("requestBody must contain tableName property", 400);
                }
                if (!req.body.data) {
                    throw this.dependencies.exceptionHandling.throwError("requestBody must contain data property", 400);
                }

                let { tableName, data } = req.body;
                let model = await prisma.Prisma.ModelName[tableName];

                if (!model) {
                    throw this.dependencies.exceptionHandling.throwError("table not found", 404);
                }

                let record = await controllers[tableName].create(req.user, data, this.dependencies, this.smsService);

                return res.status(200).json(record);

            }
            catch (error) {
                console.log(error);
                if(error.statusCode){
                    return res.status(error.statusCode).json({ message: error.message })
                }else{
                    return res.status(500).json({ message: "Internal Server Error" })
                }
            }

        });

        this.router.get("/getform/:table/:id", async (req, res, next) => {

            const { type } = req.query;

            try {
           
                if (!req.params.table) {
                    throw this.dependencies.exceptionHandling.throwError("requestParms must contain table property", 400);
                }
                if (!req.params.id) {
                    throw this.dependencies.exceptionHandling.throwError("requestParms must contain id property", 400);
                }

                let model = await prisma.Prisma.ModelName[req.params.table];
    
                if (!model) {
                    throw this.dependencies.exceptionHandling.throwError("table not found", 404);
                }

                let record = await controllers[tableName].get(req.user, data, this.dependencies, this.smsService, type);

                if(!record){
                    throw this.dependencies.exceptionHandling.throwError("record not found", 404);
                }

                return res.status(200).json(record);
                
            } catch (error) {
                console.log(error);
                if(error.statusCode){
                    return res.status(error.statusCode).json({ message: error.message })
                }else{
                    return res.status(500).json({ message: "Internal Server Error" })
                }
            }
        });

        this.router.post("/getlist/:tableName/:PageNumber/:PageSize", async (req, res, next) => {

            try {

                const { type } = req.query;
    
                let model = await prisma.Prisma.ModelName[req.params.tableName];

                if (!model) {
                    throw this.dependencies.exceptionHandling.throwError("table not found", 404);
                }

                let orderBy = [];

                if(req.body.sort) {

                    for (let key in req.body.sort) {
                        orderBy.push({
                            [key]: req.body.sort[key]
                        });
                    }

                }

                let { whereQuery, include } = await controllers[req.params.tableName].getList(req.user, req.body.condition, this.dependencies, this.smsService, type);

                const totalCount = await this.dependencies.databasePrisma[req.params.tableName].findMany({
                    where: whereQuery,
                })
    

                const records = await this.dependencies.databasePrisma[req.params.tableName].findMany({
                    where: whereQuery,
                    orderBy,
                    include: include,
                    take: parseInt(req.params.PageSize),
                    skip: (parseInt(req.params.PageNumber) - 1) * parseInt(req.params.PageSize)
                })

                return res.status(200).json({
                    Items: records,
                    PageNumber: req.params.PageNumber,
                    TotalCount: totalCount.length,
                    PageSize: parseInt(req.params.PageSize)
                });

            } catch (error) {
                console.log(error);
                if(error.statusCode){
                    return res.status(error.statusCode).json({ message: error.message })
                }else{
                    return res.status(500).json({ message: "Internal Server Error" })
                }
            }

        });

        this.router.put("/update", async (req, res, next) => {

            try {

                let { tableName, data } = req.body;

                if (!tableName || !data) {
                    throw this.dependencies.exceptionHandling.throwError("table and data are required in the request body", 400);
                }

                let model = await prisma.Prisma.ModelName[tableName];

                if (!model) {
                    console.log("table not found");
                    throw this.dependencies.exceptionHandling.throwError("table not found", 404);
                }

                if(!data.id) {
                    throw this.dependencies.exceptionHandling.throwError("request body must at least have an Id", 400);
                }

                let record = await controllers[tableName].update(req.user, data, this.dependencies, this.smsService);

                return res.status(200).json(record);

            } catch (error) {
                console.log(error);
                if(error.statusCode){
                    return res.status(error.statusCode).json({ message: error.message })
                }else{
                    return res.status(500).json({ message: "Internal Server Error" })
                }
            }

        });

        this.router.put("/changePassword", async (req, res, next) => {

            try {

                let { oldPassword, newPassword, id } = req.body;

                if (!id) {
                   throw this.dependencies.exceptionHandling.throwError("data object must contain 'id' property", 400);
                }
                if (!oldPassword) {
                    throw this.dependencies.exceptionHandling.throwError("data object must contain 'oldPassword' property", 400);
                }
                if (!newPassword) {
                    throw this.dependencies.exceptionHandling.throwError("data object must contain 'newPassword' property", 400);
                }

                let record = await ChangePassword(req.user, parseInt(id), oldPassword, newPassword, this.dependencies);
                return res.status(200).json(record);

            } catch (error) {

                console.log(error);
                if(error.statusCode){
                    return res.status(error.statusCode).json({ message: error.message })
                } else {
                    return res.status(500).json({ message: "Internal Server Error" })
                }

            }

        });

        this.router.post("/delete", async (req, res, next) => {
            try {

                let { tableName, id } = req.body;

                if(!id || !tableName) {
                    console.log("request body must have a data and table properties");
                    throw this.dependencies.exceptionHandling.throwError("request body must have a data and table properties", 400);
                }

                let model = await prisma.Prisma.ModelName[tableName];

                if (!model) {
                    throw this.dependencies.exceptionHandling.throwError("table not found", 404);
                }

                let record = await controllers[tableName].delete(req.user, (Array.isArray(id) ? id : [id]), this.dependencies, this.smsService);

                return res.status(200).json({
                    status: 200,
                    message: "record deleted succesfully",
                    data: record
                });

            }
            catch (error) {
                console.log(error);
                if(error.statusCode){
                    return res.status(error.statusCode).json({ message: error.message })
                }else{
                    return res.status(500).json({ message: "Internal Server Error" })
                }
            }
        });

        return this.router;

    }

}

