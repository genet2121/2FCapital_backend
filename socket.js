

const attachmentController = require("./controller/fileRepo/fileRepo");
const { v4: uuidv4 } = require('uuid');
const socketio = require('socket.io');
const https = require("https");
const fs = require("fs");
const express = require('express');
// const cors = require('cors');

// interface onlineUsers {
//     cashier: AuthResult,
//     connections: { type: string, connection: WebSocket }[]
// }

// let request_structure = {
//     token: "",
//     data: {
//       message: "",
//       to: "user id",
//       type: ""
//     }
// }


// let response_structure = {
//     data: "",
//     type: "",
//     to: "user id",
//     from: "user id"
// }

let call_instance = {
    sys_id: "call sys_id",
    title: "",
    created_by: "user sys_id",
    started_on: "date",
    participants: {
        "user_id": {
            name: "user name",
            video: true,
            audio: true,
            presenting: false,
        }
    }
}

const ActionTypes = {
    MessageSent: "message_sent",
    NewCallParticipant: "new_participant",
    ParticipantAnswer: "join_answer",
    NewICECandidate: "new_ice_candidate",
    LeaveCall: "leave_call",
    StartCall: "start_call",
    ParticipantsInfo: "participants_info",
    VideoStateChange: "video_state_change"
};

// const ActionTypes = {
//     MessageSent: "message_sent",
//     NewCallParticipant: "new_participant",
//     NewICECandidate: "new_ice_candidate",
//     LeaveCall: "leave_call"
// };

class ChatHandler {

    onlineCustomers = new Map();
    chatServer;
    dependencies;
    authUsers = new Map();
    onGoingCalls = new Map();

    testCalls = [];

    constructor(deps, port) {

        this.dependencies = deps;
        
        const credentials = {
            cert: fs.readFileSync('cert.crt'),
            key: fs.readFileSync('cert.key')
        };

        const app = express();
        app.use(express.static(__dirname));
        const server = https.createServer(credentials, app);

        this.chatServer = socketio(server,{
            cors: {
                origin: [
                    "https://localhost",
                    'https://192.168.100.169' //if using a phone or another computer
                ],
                methods: ["GET", "POST"]
            }
        });

        server.listen( port, () => {
            console.log(`Tribe server is running on port ${ port }`);
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

    async sendToUser(message, attachments, user, to_user) {

        try {

            //logic to add the message into message table
            const message_response = await this.dependencies.databasePrisma.message.create({
                data: {
                    send_from: user.sys_id,
                    message,
                    date: (new Date().toISOString()),
                    send_to: 1
                }
            });

            let controller = new attachmentController(this.dependencies);
            let att, indx;
            for(indx = 0; indx < attachments.length; indx += 1) {
                att = attachments[indx];
                await controller.messageAttachment(att.name, att.extension, message_response.sys_id, att.file);
            }

            this.respond(ActionTypes.MessageSent, message_response, to_user);

        } catch(error) {
            throw error;
        }

    }

    async startCall(call_id, user) {

        // logic to get call info
        let call_info = this.testCalls.find(call => call.sys_id == call_id);

        if(!call_info) {
            console.log("call not found!");
            return;
            // throw new Error("call not found!");
        }

        let participants = new Map();

        participants.set(user.sys_id, {
            sys_id: user.sys_id,
            name: user.full_name,
            video: false,
            audio: false,
            presenting: false,
            creator: true,
            // offer,
            // iceCandidate: []
        });

        this.onGoingCalls.set(call_info.sys_id, {
            sys_id: call_info.sys_id,
            title: call_info.title,
            created_by: user.sys_id,
            started_on: new Date().toISOString(),
            participants
        });

        // console.log(this.onGoingCalls);

    }

    async leaveCall(call_id, user) {

        let found_call = this.onGoingCalls.get(call_id);

        if(!found_call){
            return;
        }

        let found_participant = found_call.participants.delete(user.sys_id)
        let current_participants = Array.from(found_call.participants.keys()).filter(pi => (pi != user.sys_id));

        if(!found_participant) {
            console.log("participant not allowed");
            return;
            // throw new Error("participant not allowed");
        }

        this.onGoingCalls.set(call_id, found_call);

        if(current_participants.length > 0) {
            this.respond(ActionTypes.LeaveCall, {user_id: user.sys_id, video: video_state}, current_participants);
        } else {
            this.onGoingCalls.delete(call_id);
        }

    }

    async joinCall(call_id, offers, user){

        let found_call = this.onGoingCalls.get(call_id);

        if(!found_call){
            throw new Error("Call has ended!");
        }

        if(found_call.participants.get(user.sys_id)) {
            found_call.participants.delete(user.sys_id);
        }

        let new_participant = {
            name: user.full_name,
            video: false,
            audio: false,
            presenting: false,
            creator: false,
            // offer,
            // iceCandidate: []
        };

        let current_participants = Array.from(found_call.participants.keys());
        found_call.participants.set(user.sys_id, new_participant);
        this.onGoingCalls.set(call_id, found_call);
        offers.forEach(participant => {
            if(current_participants.includes(participant.user_id)) {
                this.respond(ActionTypes.NewCallParticipant, {
                    offer: participant.offer,
                    user_id: user.sys_id
                }, participant.user_id);
            }
        });

    }

    async joinAnswer(call_id, user_id, offer, user) {

        let found_call = this.onGoingCalls.get(call_id);
        
        if(!found_call){
            throw new Error("Call has ended!");
        }
        
        let current_participants = Array.from(found_call.participants.keys());
        
        if(!current_participants.includes(user_id)){
            throw new Error("the participant is not in the call!");
        }

        if(!current_participants.includes(user_id)){
            throw new Error("you are not in the call!");
        }

        this.respond(ActionTypes.ParticipantAnswer, {
            offer,
            user_id: user.sys_id
        }, user_id);

    }

    async changeAudioState(call_id, user, audio_state) {

        let found_call = this.onGoingCalls.get(call_id);

        if(!found_call){
            throw new Error("Call has ended!");
        }

        let found_participant = found_call.participants.get(user.sys_id)
        let current_participants = Array.from(found_call.participants.keys()).filter(pi => (pi != user.sys_id));

        if(!found_participant) {
            throw new Error("participant not allowed");
        }

        found_participant.audio = audio_state;
        found_call.participants.set(user.sys_id, found_participant);
        this.onGoingCalls.set(call_id, found_call);

        this.respond(ActionTypes.NewICECandidate, {user_id: user.sys_id, audio: audio_state}, current_participants);

    }

    async changeVideoState(call_id, user, video_state) {

        let found_call = this.onGoingCalls.get(call_id);

        if(!found_call){
            throw new Error("Call has ended!");
        }

        let found_participant = found_call.participants.get(user.sys_id)
        let current_participants = Array.from(found_call.participants.keys()).filter(pi => (pi != user.sys_id));

        if(!found_participant) {
            throw new Error("participant not allowed");
        }

        found_participant.video = video_state;
        found_call.participants.set(user.sys_id, found_participant);
        this.onGoingCalls.set(call_id, found_call);

        this.respond(ActionTypes.VideoStateChange, {user_id: user.sys_id, video: video_state}, current_participants);

    }

    async startPresenting(call_id, user) {}
    async stopPresenting(call_id, user) {}

    async sendICECandidate(call_id, user_id, ice_candidate, user) {

        let found_call = this.onGoingCalls.get(call_id);

        if(!found_call) {
            throw new Error("Call has ended!");
        }

        let found_participant = found_call.participants.get(user.sys_id)

        if(!found_participant) {
            throw new Error("participant not allowed")
        }

        this.respond(ActionTypes.NewICECandidate, {
            iceCandidate: ice_candidate,
            user_id: user.sys_id
        }, user_id);

    }

    async sendAudio(call_id, user, audio_buffer) {}

    respond(handler_name, data, user_id){

        if(Array.isArray(user_id)) {
            user_id.forEach(id => {
                this.sendData(handler_name, data, id);
            });
        } else {
            this.sendData(handler_name, data, user_id);
        }

    }

    sendData(handler_name, data, user_id) {

        let found_user = this.authUsers.get(user_id);
        if(found_user) {
            found_user.connection.emit(handler_name, data);
        } else {
            console.log(handler_name, "user is not connected");
        }

    }

    onlineUsers(data, user) {
        this.respond(
            this.response_type.online_users,
            Array.from(this.onlineCustomers.values()).filter(customer => data.id.includes(customer.user.sys_id)).map(customer => customer.user),
            user.sys_id
        );
    }

    makeOnline(connected_user, connection) {

        if(!this.authUsers.get(connected_user.sys_id)) {
            this.authUsers.set(connected_user.sys_id, {
                user: connected_user,
                connection
            });
        }

        // if(!this.onlineCustomers.get(connected_user.sys_id)) {

            // this.onlineCustomers.set(connected_user.sys_id, {
            //     user: connected_user,
            //     connection
            // });

        // }

        // else if(con_state == "online") {
        //     let current_connection = this.onlineCustomers.get(connected_user.sys_id);
        //     current_connection.connection = connection;
        //     this.onlineCustomers.set(connected_user.sys_id, current_connection);
        // }

        // console.log("online customers ", this.onlineCustomers.values());
        // connection.send(JSON.stringify({
        //     handler_name: this.response_type.online_users,
        //     data: Array.from(this.onlineCustomers.values()).filter(customer => (customer.sys_id != connected_user.sys_id)).map(customer => customer.user)
        // }));

    }

    getUser(user_id){

        let found_user = this.authUsers.get(user_id);
        if(!found_user) {
            console.log("user not found! authentication failed!");
            return;
            // throw new Error("user not found! authentication failed!");
        }

        return found_user.user;

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

    start() {

        this.chatServer.on("connection", async (socket) => {

            try {

                // if(!socket.handshake.auth.token) {
                //     socket.disconnect(true);
                //     return;
                // }

                // let token = socket.handshake.auth.token;
                let connected_user;

                if(socket.handshake.auth.token) {
                    connected_user = await this.Authenticator(socket.handshake.auth.token);
                    this.makeOnline(connected_user, socket)
                } else {
                    connected_user = this.anonimusUser();
                    this.authUsers.set(connected_user.sys_id, {user: connected_user, connection: socket});
                }

                socket.on(ActionTypes.MessageSent, async (data) => {
                    await this.sendToUser(data.message, data.attachments, connected_user, data.toUser);
                });

                /*
                {
                    callId: ,
                    offer: ,
                }
                */
                socket.on(ActionTypes.StartCall, async (data) => {
                    // let reqUser = this.getUser(data.user_id)
                    await this.startCall(data.callId, connected_user);
                });
                
                /*
                {
                    callId: ,
                    iceCandidate: ,
                    user_id: 
                }
                */
                socket.on(ActionTypes.NewICECandidate, async (data) => {
                    // let reqUser = this.getUser(data.user_id)
                    await this.sendICECandidate(data.callId, data.user_id, data.iceCandidate, connected_user);
                });

                /*
                {
                    callId: ,
                    offers: ,
                }
                */
                socket.on(ActionTypes.NewCallParticipant, async (data) => {
                    // let reqUser = this.getUser(data.user_id)
                    await this.joinCall(data.callId, data.offers, connected_user);
                });

                /*
                {
                    callId: ,
                    offer: ,
                    user_id: 
                }
                */
                socket.on(ActionTypes.ParticipantAnswer, async (data) => {
                    // let reqUser = this.getUser(data.user_id)
                    await this.joinAnswer(data.callId, data.user_id, data.offer, connected_user);
                });

                /*
                call_id
                */
                socket.on(ActionTypes.LeaveCall, async (data) => {
                    // let reqUser = this.getUser(data.user_id)
                    await this.leaveCall(data, connected_user);
                });
            
                socket.on("create_call", async (data) => {
        
                    // let reqUser = this.getUser(data.user_id)
                    let call_info = {
                        sys_id: uuidv4(),
                        title: "new call",
                        created_by: connected_user.sys_id,
                        started_on: new Date().toISOString(),
                    };
        
                    this.testCalls.push(call_info);
                    socket.emit("create_call", call_info);
        
                });

                /*
                {
                    call_id: ,
                    user_id: 
                }
                */
                socket.on("call_info", async (data) => {
        
                    // let reqUser = this.getUser(data.user_id)
                    // logic to get call info
                    let call_info = this.onGoingCalls.get(data.call_id);
        
                    if(!call_info) {
                        throw new Error("call not started yet");
                    }
        
                    let call_participants = Array.from(call_info.participants.values());
        
                    socket.emit("call_info", {...call_info, participants: call_participants});
        
                });
        
                socket.on("zewd_disconnect", (data) => {
                    // await this.leaveCall(data, reqUser);
                });
                socket.on("get_auth", async (data) => {
                    socket.emit("get_auth", connected_user);
                });

                socket.emit("get_auth", connected_user);

            } catch(error) {
                console.log(error.message);
            }

        });

    }

}

module.exports = ChatHandler;