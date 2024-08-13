
const ProjectDependencies = require("../../../configuration/dependencies");
const authorization = require("../../middleware/authorization");

const dependencies = new ProjectDependencies();
const {port} = dependencies.getDependencies()


const deps = dependencies.getDependencies();
   
module.exports = {

    invalidatedTokens : new Set(),

    async authenticate(req, res, next) {
        try {

            if(!req.headers.authorization) {
                let temp_user = {
                    Id: 0,
                    FullName: "unknown",
                    Email: "",
                    Phone: "",
                    Roles: ["guest"],
                    Approved: "false",
                    Location: "",
                    Status: "false"
                };
                req.user = temp_user; 
                req.userAuthorization = authorization(temp_user);

            } else {
                const token = req.headers.authorization.split(" ")[1];
                const user = await deps.tokenGenerator.verify(token, deps.appSecretKey);/* as JwtPayload*/;
                req.user = user; 
                req.userAuthorization = authorization(user);
                next();
            }

        } catch (error) {
            if(error.statusCode) {
                return res.status(error.statusCode).json({ message: error.message })
            }else{
                return res.status(500).json({ message: "Internal Server Error" })
            }
        }
    },
    
    



}

