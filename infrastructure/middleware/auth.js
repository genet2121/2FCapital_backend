
import { Request, Response } from "express";


import jwt, {JwtPayload} from "jsonwebtoken"
import authorization from "./authorization";


export default class AuthMiddleware {

     appSecretKey;

    constructor(key) {
        this.appSecretKey = key;
    }
 

    authenticate(req, res, next) {
            try {
                
                const token = req.headers.authorization.split(" ")[1];
                const user = jwt.verify(token, this.appSecretKey);/* as JwtPayload*/;
                req.user = user;
                req.userAuthorization = authorization(user);

            } catch (err) {  
                console.log(err);
                throw new Error(err);
            }
            next();
    
    }
    

}
