const FieldsMapper = require("../../infrastructure/FieldMapper");
const ZodValidation = require("../../infrastructure/service/validation/zodValidation");
const BookValidator = require("./BookValidator");
const Roles = require("../../Interface/Roles");


module.exports = async function (reqUser, authorization, input, dependencies, smsService) {

    try {

        if(!authorization.can("update", "book")) {
            throw dependencies.exceptionHandling.throwError("Unauthorized user", 500);
        }

        let condition = {id: input.id};
        if(!reqUser.Roles.includes(Roles.Admin)) {
            condition.owner_id = reqUser.Id
        }

        // let validated = await dependencies.routingValidator.validatOnUpdateRecord("book", input);
        let validated = ZodValidation(BookValidator.create, input, dependencies);
        if (validated) {

            const foundRecord = await dependencies.databasePrisma.book.findFirst({
                where: condition
            });

            if(!foundRecord) {
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

            const recordData = FieldsMapper.mapFields(input, "book");
            return await dependencies.databasePrisma.book.update({
                where: {
                    id: input.id
                },
                data: recordData,
            });

        }

    } catch (error) {
        console.log(error);
        if(error.statusCode){
            throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }else{
            throw dependencies.exceptionHandling.throwError("Internal Server Error", 500);
        }
    }
}