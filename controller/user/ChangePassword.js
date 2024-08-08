module.exports = async function (reqUser, authorization, id, oldPassword, newPassword, dependencies) {

    try {

        let user = await dependencies.databasePrisma.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) {
            throw dependencies.exceptionHandling.throwError("User Not Found", 404);
        }

        class User {
            id;
            constructor(Id) {
                this.id = Id;
            }
        };

        // if(!reqUser || reqUser.Roles.includes("admin") || user.id == reqUser.Id){
        if(authorization.can("update", new User(id))) {

            if (!await dependencies.encryption.compare(oldPassword, user.password)) {
                throw dependencies.exceptionHandling.throwError("Incorrect old password", 401); 
            } else {

                user.password = await dependencies.encryption.hash(newPassword)

                return await dependencies.databasePrisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        password: user.password
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