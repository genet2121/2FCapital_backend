module.exports = async function (reqUser, id, oldPassword, newPassword, dependencies) {

    try {

        let user = await this.getUser(id);
        if (!user) {
            throw dependencies.exceptionHandling.throwError("User Not Found", 404);
        } 
        if(reqUser.Roles.includes("admin") || user.id == reqUser.Id){

            if (!await dependencies.encryption.compare(oldPassword, user.Password)) {
                throw dependencies.exceptionHandling.throwError("Incorrect old password", 401); 
            }else{

                user.Password = await dependencies.encryption.hash(newPassword)

                return await dependencies.databasePrisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        Password: user.Password
                    },
                });

            }


        }else{
            throw dependencies.exceptionHandling.throwError("Unauthorized Access! Only the admin and the user owning the record can change a password.", 401); 
        }

    } catch (error) {

        console.log(error);
        if(error.statusCode){
            throw dependencies.exceptionHandling.throwError(error.message, error.statusCode);
        }else{
            throw dependencies.exceptionHandling.throwError('Internal Server Error', 500);
        }

    }

}