

const {WebSocketServer} = require("ws");
const WebSocket = require("ws");
const https = require("https");
const fs = require("fs");
const attachmentController = require("./controller/fileRepo/fileRepo");

// interface onlineUsers {
//     cashier: AuthResult,
//     connections: { type: string, connection: WebSocket }[]
// }

// let request_structure = {
//     message: "",
//     token: "",
//     to: "user id",
//     type: ""
// }


// let response_structure = {
//     data: "",
//     type: "",
//     to: "user id",
//     from: "user id"
// }

class CallHandler {

    onlineCustomers = new Map();
    onlineSupports = new Map();

    response_type = {
        incoming_message: "incoming",
        online: "online",
        user_disconnect: "user_disconnected",
        online_users: "online_users",
        new_user: "new_user",
        error: "error"
    };

    connection_type = {
        customer: "customer",
        support: "support"
    };

    constructor(deps, port) {
        this.dependencies = deps;
        this.serverPort = port;
    }

     async Authenticator(token) {
        let user = await this.dependencies.tokenGenerator.verify(token, this.dependencies.appSecretKey);
        if(!user) {
            throw this.dependencies.exceptionHandling.throwError("Invalid Token", 401);
        }
        return ({
            ...user
        });
    }

    async sendToGroup(message, group_id, ){

    }

    async sendToSupport(message, attachments, sender) {

        try{

            //logic to add the message into message table
            const message_response = await this.dependencies.databasePrisma.message.create({
                data: {
                    chatId: sender.toString(),
                    message,
                    date: (new Date().toISOString()),
                    boat: 0
                }
            });
    
            let controller = new attachmentController(this.dependencies);
            let att, indx;
            for(indx = 0; indx < attachments.length; indx += 1) {
                att = attachments[indx];
                await controller.messageAttachment(att.name, att.extension, message_response.id, att.file);
            }

            console.log("online supports ", this.onlineSupports.values());
            Array.from(this.onlineSupports.values()).forEach(sp => {

                sp.connection.connection.send(JSON.stringify({
                    status: this.response_type.incoming_message,
                    data: message_response,
                    from: sender
                }));

            });

        } catch(error) {
            throw error;
        }

    }

    async sendToUser(message, attachments, user) {

        try {

            let found_user = this.onlineCustomers.get(parseInt(user));
    
            if(found_user) {
    
                //logic to add the message into message table
                const message_response = await this.dependencies.databasePrisma.message.create({
                    data: {
                        chatId: user.toString(),
                        message,
                        date: (new Date().toISOString()),
                        boat: 1
                    }
                });
    
                let controller = new attachmentController(this.dependencies);
                let att, indx;
                for(indx = 0; indx < attachments.length; indx += 1) {
                    att = attachments[indx];
                    await controller.messageAttachment(att.name, att.extension, message_response.id, att.file);
                }
    
                found_user.connection.connection.send(JSON.stringify({
                    status: this.response_type.incoming_message,
                    data: message_response
                }));
            }

        } catch(error){
            throw error;
        }

    }

    makeOnline(connected_user, type, connection, con_state) {

        if (!connected_user.Roles.includes("user")) {

            if(!this.onlineSupports.get(parseInt(connected_user.Id))) {

                this.onlineSupports.set(parseInt(connected_user.Id), {
                    user: connected_user,
                    connection: {
                        type,
                        connection
                    }
                });
                
            } else if(con_state == "online") {
                let current_connection = this.onlineSupports.get(parseInt(connected_user.Id));
                current_connection.connection.connection = connection;
                this.onlineSupports.set(parseInt(connected_user.Id), current_connection);
            }

            console.log("online customers ", this.onlineCustomers.values());
            connection.send(JSON.stringify({
                status: this.response_type.online_users,
                data: Array.from(this.onlineCustomers.values()).map(customer => customer.user)
            }));

        } else {
            if(!this.onlineCustomers.get(parseInt(connected_user.Id))){

                this.onlineCustomers.set(parseInt(connected_user.Id), {
                    user: connected_user,
                    connection: {
                        type,
                        connection
                    }
                });

                this.onlineSupports.forEach(sp => {

                    sp.connection.connection.send(JSON.stringify({
                        status: this.response_type.new_user,
                        data: connected_user
                    }));

                });
            } else if(con_state == "online") {
                let current_connection = this.onlineCustomers.get(parseInt(connected_user.Id));
                current_connection.connection.connection = connection;
                this.onlineCustomers.set(parseInt(connected_user.Id), current_connection);
            }
        }

    }

    anonimusUser() {
        return {
            Id: (new Date().getTime()),
            FullName: "Unknown Customer",
            Email: "no email",
            Password: "",
            Phone: "no Phone",
            Roles: ["user"]
        };
    }

    start() {

        const credentials = {
            cert: fs.readFileSync("/etc/letsencrypt/live/nuwamobile.com/fullchain.pem"),
            key: fs.readFileSync("/etc/letsencrypt/live/nuwamobile.com/privkey.pem")
        };

        const server = https.createServer(credentials);
        const sockserver = new WebSocket.Server({
            server
        });

        // const sockserver = new WebSocketServer({ port: this.dependencies.chatPort });
        // console.log(`Nuwa technology server is running on port ${this.dependencies.chatPort}`);

        server.listen(this.dependencies.chatPort, () => {
            console.log(`Nuwa technology server is running on port ${this.dependencies.chatPort}`);
        });

        sockserver.on('connection', ws => {

            let connected_user;

            ws.on('close', () => console.log('Client has disconnected!'));

            ws.on('message',async data => {

                try {

                    let req = JSON.parse(data.toString());

                    if(req.message) {
                        req.message = req.message.replace(/[<>'`]/g, '');
                    }

                    if(!req.attachments) {
                        req.attachments = [];
                    }

                    if(req.token){
                        connected_user = await this.Authenticator(req.token);
                    } else if(req.chatId && this.onlineCustomers.get(parseInt(req.chatId))){
                        connected_user = this.onlineCustomers.get(parseInt(req.chatId)).user
                    } else {
                        connected_user = this.anonimusUser();
                    }

                    this.makeOnline(connected_user, connected_user.Roles[0], ws, req.status);
                   
                    if(req.status == "online") {
                        ws.send(JSON.stringify({
                            status: this.response_type.online,
                            data: connected_user
                        }));
                    } else if(req.status == this.response_type.incoming_message) {

                        if(req.message.length > 253){
                            throw new Error("out of limmit");
                        }

                        if(connected_user.Roles.includes("user")) {
                            await this.sendToSupport(req.message, req.attachments, connected_user.Id);
                        } else {
                            await this.sendToUser(req.message, req.attachments, req.to);
                        }
                    }

                } catch (error) {
                    console.log(error.message)
                    ws.send(JSON.stringify({
                        status: this.response_type.error,
                        data: error.message
                    }));
                }

            });

            // ws.send("connected successfully");
            console.log("connected successfully");

            ws.onerror = function () {
                console.log('websocket error');
            }

        });

    }



}

module.exports = ChatHandler;