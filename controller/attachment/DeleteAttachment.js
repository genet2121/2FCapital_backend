module.exports = async function (reqUser, id, dependencies, smsService) {
    try {

        const userAttachment = await dependencies.databasePrisma.attachment.findFirst({
            where: { id: id }
        });
        if (!userAttachment) {
            throw dependencies.exceptionHandling.throwError("attachment with " + id + " id does not exist", 404);
        }
        const attachment = await dependencies.databasePrisma.attachment.delete({
            where: { id: { in: id } }
        });

        return attachment;
    }
    catch (error) {
        throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
    }
}