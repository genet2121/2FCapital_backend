module.exports = async function (reqUser, input, dependencies, smsService) {
    try {

        let validated = await dependencies.routingValidator.validatOnUpdateRecord("attachment", attachment);
        if (validated) {
            
            const foundAttachment = await dependencies.databasePrisma.attachment.findFirst({
                where: {
                    id: input.id
                }
            });

            if(!input.id){
                throw dependencies.exceptionHandling.throwError("request body must atleast have an Id", 400);
            }
            if(foundAttachment){
                if (reqUser.Roles.includes("admin") || foundAttachment.id == reqUser.id) {
     
                    return await dependencies.databasePrisma.foundAttachment.update({
                        where: {
                            id: input.id
                        },
                        data: input,
                    });

                } else {
                    throw dependencies.exceptionHandling.throwError("Unauthorized access! Only the admin and the user owning the record can update it.", 401);
                }
            }else{
                throw dependencies.exceptionHandling.throwError("record not found.", 404);
            }

           
        }


    } catch (error) {
        console.log(error);
        throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
    }
}