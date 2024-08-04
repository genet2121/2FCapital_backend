const FieldsMapper = require("../../infrastructure/FieldMapper");

module.exports = async function (reqUser, data, dependencies, smsService) {

    try {

        let validated = await dependencies.routingValidator.validateRecord("attachment", data);
        if (validated) {

            let attachment_input = FieldsMapper.mapFields(data, "attachment");

            return await dependencies.databasePrisma.attachment.create({
                data: attachment_input
            });

        }

    } catch (error) {
        throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
    }

}
