module.exports = async function (reqUser, id, dependencies, smsService, type) {
    try {
        const attachment = await dependencies.databasePrisma.attachment.findFirst({
            where: {
                id: Number(id)
            }
        })

        if (!attachment) {
            throw new dependencies.exceptionHandling.throwError("No attachment exist with the given id", 404);
        }
        return attachment;
    } catch (error) {
        throw new dependencies.exceptionHandling.throwError(error.message, error.statusCode);
    }
}