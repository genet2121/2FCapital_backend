const {WebSocketServer} = require("ws");
const WebSocket = require("ws");
const https = require("https");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const express = require('express');
// const cors = require('cors');


const app = express();
app.use(express.static(__dirname));
// app.use(cors({
//     origin: [
//         // "https://localhost",
//         'https://192.168.100.119', //if using a phone or another computer
//         'https://192.168.100.169' //if using a phone or another computer
//     ],
//     methods: ["GET", "POST"]
// }));

// interface onlineUsers {
//     cashier: AuthResult,
//     connections: { type: string, connection: WebSocket }[]
// }

// let request_structure = {
//     message: "",
//     token: "",
//     handler_name: "",
//     to: "user id",
//     type: ""
// }


// let response_structure = {
//     data: "",
//     type: "",
//     to: "user id",
//     from: "user id"
// }

class ZewdSocket {

    onlineCustomers = new Map();
    Handlers = new Map();

    authUsers = new Map();

    response_type = {
        incoming_message: "incoming",
        online: "online",
        user_disconnect: "user_disconnected",
        online_users: "online_users",
        new_user: "new_user",
        error: "error"
    };

    constructor(port) {

        const credentials = {
            cert: fs.readFileSync('cert.crt'),
            key: fs.readFileSync('cert.key')
        };
        // const credentials = {
        //     cert: fs.readFileSync("/etc/letsencrypt/live/tribe.com/fullchain.pem"),
        //     key: fs.readFileSync("/etc/letsencrypt/live/tribe.com/privkey.pem")
        // };

        const server = https.createServer(credentials, app);
        // const server = https.createServer(credentials);
        const sockserver = new WebSocket.Server({ server });

        server.listen( port, () => {
            console.log(`Tribe server is running on port ${ port }`);
        });


        // const sockserver = new WebSocketServer({ port });
        // console.log(`Tribe server is running on port ${ port }`);

        sockserver.on('connection', ws => {

            let connected_user;

            ws.on('close', () => {
                console.log('Client has disconnected!');
            });

            ws.on('message',async data => {

                try {

                    let req = JSON.parse(data.toString());

                    if(req.token) {
                        connected_user = await this.Authenticator(req.token);
                        // console.log("connected user ", connected_user);
                    } else {
                        connected_user = this.anonimusUser();
                        this.authUsers.set(connected_user.sys_id, connected_user);
                    }

                    ws.on('close', async () => {
                        console.log('Client has disconnected!');
                        this.disconnectUser(connected_user.sys_id);
                        try {
                            await this.callHandler(req.data, "zewd_disconnect", connected_user);
                        } catch(in_error) {
                            ws.send(JSON.stringify({
                                handler_name: this.response_type.error,
                                data: in_error.message
                            }));
                        }
                    });

                    this.makeOnline(connected_user, connected_user.Roles[0], ws, req.handler_name);
                    await this.callHandler(req.data, req.handler_name, connected_user);

                } catch (error) {
                    console.log(error.message)
                    ws.send(JSON.stringify({
                        handler_name: this.response_type.error,
                        data: error.message
                    }));
                }

            });

            // ws.send("connected successfully");
            // console.log("connected successfully");

            ws.onerror = function () {
                console.log('websocket error');
            }

        });

    }

    async Authenticator(token) {
        // let user = await this.dependencies.tokenGenerator.verify(token, this.dependencies.appSecretKey);
        // if(!user) {
        //     throw this.dependencies.exceptionHandling.throwError("Invalid Token", 401);
        // }

        let user = this.authUsers.get(token);
        return ({
            ...user
        });
    }

    setHandlers(handler_name, handler_function) {
        this.Handlers.set(handler_name, handler_function);
        // console.log(this.Handlers, "handler setted");
        // if("zewd_disconnect" != handler_name) {
        // }
    }

    async callHandler(data, handler_name, reqUser) {

        console.log("callHandler is called", handler_name);
        if(handler_name == this.response_type.online_users) {
            this.onlineUsers(data, reqUser);
        } else if(handler_name == "get_auth") {
            this.respond("get_auth", reqUser, reqUser.sys_id);
        } else {

            let found_function = this.Handlers.get(handler_name);
            if(!found_function) {
                throw new Error("handler not found!");
            }

            await found_function(data, reqUser, this.authUsers);

        }

    }

    onlineUsers(data, user) {
        this.respond(
            this.response_type.online_users,
            Array.from(this.onlineCustomers.values()).filter(customer => data.id.includes(customer.user.sys_id)).map(customer => customer.user),
            user.sys_id
        );
    }

    disconnectHandler(handler_function) {
        // console.log("disconnect handler is set");
        this.Handlers.set("zewd_disconnect", handler_function);
        // console.log(this.Handlers, "handler setted");
    }

    respond(handler_name, data, user_id){

        if(Array.isArray(user_id)) {
            user_id.forEach(id => {
                this.sendData(handler_name, data, id);
            });
        }else {
            this.sendData(handler_name, data, user_id);
        }

    }

    sendData(handler_name, data, user_id) {

        let found_user = this.onlineCustomers.get(user_id);
        if(found_user) {

            found_user.connection.connection.send(JSON.stringify({
                handler_name,
                data
            }));

        } else {
            console.log("user is not connected");
        }

    }

    makeOnline(connected_user, type, connection, con_state) {

        if(!this.onlineCustomers.get(connected_user.sys_id)) {
        // if(!this.authUsers.get(connected_user.sys_id)) {

            this.onlineCustomers.set(connected_user.sys_id, {
                user: connected_user,
                connection: {
                    type,
                    connection
                }
            });

        } else if(con_state == "online") {
            let current_connection = this.onlineCustomers.get(connected_user.sys_id);
            current_connection.connection.connection = connection;
            this.onlineCustomers.set(connected_user.sys_id, current_connection);
        }

        // console.log("online customers ", this.onlineCustomers.values());
        connection.send(JSON.stringify({
            handler_name: this.response_type.online_users,
            data: Array.from(this.onlineCustomers.values()).filter(customer => (customer.sys_id != connected_user.sys_id)).map(customer => customer.user)
        }));

    }

    disconnectUser(user_id) {
        this.onlineCustomers.delete(user_id);
        this.respond(
            this.response_type.disconnectUser,
            user_id,
            Array.from(this.onlineCustomers.values()).map(customer => customer.user.sys_id),
        );
    }

    anonimusUser() {
        return {
            sys_id: uuidv4(),
            full_name: "Unknown Customer",
            Email: "no email",
            Password: "",
            Phone: "no Phone",
            Roles: ["user"]
        };
    }

}

module.exports = ZewdSocket;