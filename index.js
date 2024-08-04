
let main_video;
let mediaStream;
let cameraState = true;
let buttons = {};
let socket;
let participants = new Map();
let currentCall;
let call_info_display, call_id_display, call_id_input;
let currentUser;
let unknownICECandidate = new Map();
let peerConfiguration = {
    iceServers:[
        {
            urls:[
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302'
            ]
        }
    ]
};

// let serverAddress = "ws://localhost:7000";
let serverAddress = "wss://192.168.100.169:7000";
// let serverAddress = "https://192.168.100.119:7000";

const ActionTypes = {
    NewCallParticipant: "new_participant",
    NewICECandidate: "new_ice_candidate",
    LeaveCall: "leave_call",
    StartCall: "start_call",
    ParticipantAnswer: "join_answer",
    ParticipantsInfo: "participants_info"
};

window.onload = async () => {

    // socket = new ZewdSocket();
    // socket.connect(serverAddress);
    socket = io.connect(serverAddress, {
        auth: {
            token: null
        }
    });
    
    // socket.on("connect", (data) => {
    //     console.log("...connection successfull", data)
    //     socket.emit("get_auth", {});
    // });
    
    socket.on("get_auth", (data) => {
        console.log("...connection successfull", data)
        currentUser = data;
    });
    
    socket.on("create_call", (data) => {
        currentCall = data;
        buttons.call.style.display = "none";
        buttons.end_call.style.display = "";
        changeJoinFormState(false);
        call_id_display.innerHTML = data.sys_id;
        socket.emit(ActionTypes.StartCall, {callId: data.sys_id});
    });

    socket.on(ActionTypes.NewICECandidate, (data) => {

        let found_participant = participants.get(data.user_id);
        if(found_participant){
            found_participant.peerConnection.addIceCandidate(data.iceCandidate);
        } else {
            console.log("ice candidate to unknow user");
            let found_previous = unknownICECandidate.get(data.user_id);
            if(found_previous){
                found_previous.push(data.iceCandidate);
                unknownICECandidate.set(data.user_id, found_previous);
            } else {
                unknownICECandidate.set(data.user_id, [data.iceCandidate]);
            }
        }

    });

    socket.on(ActionTypes.NewCallParticipant, async (data) => {

        let creation_result = await createPeerConnection(data.user_id, data.offer);
        let answer = await creation_result.peerConnection.createAnswer({});
        await creation_result.peerConnection.setLocalDescription(answer);

        let new_participant = {
            name: "unknown user",
            video: false,
            audio: false,
            presenting: false,
            creator: false,
            ...creation_result
        };

        // data.offer.answer = answer;

        participants.set(data.user_id, new_participant);

        createNewParticipant(data.user_id);

        setTimeout(() => {
            let participant_video = document.getElementById(data.user_id);

            participant_video.srcObject = participants.get(data.user_id).remoteStream;
        }, 1000);

        socket.emit(ActionTypes.ParticipantAnswer, {offer: answer, user_id: data.user_id, callId: currentCall.sys_id});

    });

    socket.on(ActionTypes.ParticipantAnswer, async (data) => {
        console.log("join answer is received");
        let found_participant = participants.get(data.user_id);
        let participant_ids = participants.keys().filter(p_id => p_id != currentUser.sys_id);
        if(found_participant) {
            participants.get(data.user_id).peerConnection.setRemoteDescription(data.offer);
            let found_previous = unknownICECandidate.get(data.user_id);
            if(found_previous) {
                found_previous.forEach(ice_candidate => {
                    console.log("previous ice candidate found and add");
                    found_participant.peerConnection.addIceCandidate(ice_candidate);
                });
            } else {
                unknownICECandidate.set(data.user_id, data.iceCandidate);
            }
            participants.set(data.user_id, found_participant);
            setRemoteStreams(participant_ids);
        }
    })

    socket.on("call_info", async (data) => {

        currentCall = data;
        let participant_ids = data.participants.map(prt => prt.sys_id);
        buttons.call.style.display = "none";
        buttons.end_call.style.display = "";
        // changeJoinFormState(false);

        let offers = [];
        // let creation_result = await createPeerConnection(data.user_id, data.offer);
        // let answer = await creation_result.peerConnection.createAnswer({});
        // await creation_result.peerConnection.setLocalDescription(answer);

        for(let i = 0; i < participant_ids.length; i ++) {

            let new_participant = await prepareParticipantConnection(participant_ids[i]);
            offers.push({
                user_id: participant_ids[i],
                offer: new_participant.answer
            });

            participants.set(participant_ids[i], new_participant.pr);
            createNewParticipant(participant_ids[i]);

            setTimeout(() => {
                setRemoteStreams(participant_ids);
            }, 1000);

        }

        socket.emit(ActionTypes.NewCallParticipant, {
            offers,
            callId: currentCall.sys_id
        });

    });

    socket.on(ActionTypes.LeaveCall, (data) => {
        currentCall = data;
        buttons.call.style.display = "none";
        buttons.end_call.style.display = "";
        changeJoinFormState(false);
    });
        
    call_info_display = document.getElementById("call_info_display");
    call_id_display = document.getElementById("call_id_display");
    call_id_input = document.getElementById("call_id_input");

    main_video = document.getElementById("main_video");
    main_video.addEventListener("loadedmetadata", () => {
        main_video.play();
    });

    buttons.mute = document.getElementById("mute_button");
    buttons.mute.addEventListener("click", () => {
        buttons.mute.innerHTML = main_video.muted ? "Mute" : "Unmute";
        mediaStream.getAudioTracks().forEach(track => {track.enabled = main_video.muted});
        main_video.muted = !main_video.muted;
        // alert("clicked");
    });

    buttons.camera = document.getElementById("camera_button");
    buttons.camera.addEventListener("click", () => {
        buttons.camera.innerHTML = cameraState ? "On" : "Off";
        mediaStream.getVideoTracks().forEach(track => {track.enabled = !cameraState});
        cameraState = !cameraState;
        // alert("clicked");
    });

    buttons.call = document.getElementById("call_button");
    buttons.call.addEventListener("click", () => {
        socket.emit("create_call", {});
        // alert("working");
    });

    buttons.join_button = document.getElementById("join_button");
    buttons.join_button.addEventListener("click", async () => {
        socket.emit("call_info", {call_id: call_id_input.value});
    });

    buttons.end_call = document.getElementById("end_call_button");

    await getMedia();
    main_video.srcObject = mediaStream;

};

async function getMedia() {
    try {
        mediaStream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            // audio: true
        });

        // console.log("found media stream", mediaStream.getTracks());
        
    } catch(error){
        console.log(error.message);
    }
}

const createPeerConnection = async (user_id, offerObj) => {
    //RTCPeerConnection is the thing that creates the connection
    //we can pass a config object, and that config object can contain stun servers
    //which will fetch us ICE candidates
    let peerConnection = new RTCPeerConnection(peerConfiguration)
    let remoteStream = new MediaStream()
    // remoteVideoEl.srcObject = remoteStream;


    mediaStream.getTracks().forEach(track=>{
        //add localtracks so that they can be sent once the connection is established
        peerConnection.addTrack(track, mediaStream);
    })

    peerConnection.addEventListener("signalingstatechange", (event) => {
        // console.log(event);
        // console.log(peerConnection.signalingState)
    });

    peerConnection.addEventListener('icecandidate',e=>{
        console.log('........Ice candidate found!......')
        // console.log(e)
        if(e.candidate){
            socket.emit(ActionTypes.NewICECandidate, {
                iceCandidate: e.candidate,
                callId: currentCall.sys_id,
                user_id
            });
        }
    })
    
    peerConnection.addEventListener('track',e=>{
        console.log("Got a track from the other peer!! How excting")
        // console.log(e)
        e.streams[0].getTracks().forEach(track=>{
            let found_participant = participants.get(user_id);
            if(found_participant) {
                found_participant.remoteStream.addTrack(track,found_participant.remoteStream);
                participants.set(user_id, found_participant)
            }
            // console.log("Here's an exciting moment... fingers cross")
        })
    })

    if(offerObj) {
        //this won't be set when called from call();
        //will be set when we call from answerOffer()
        // console.log(peerConnection.signalingState) //should be stable because no setDesc has been run yet
        await peerConnection.setRemoteDescription(offerObj)
        // console.log(peerConnection.signalingState) //should be have-remote-offer, because client2 has setRemoteDesc on the offer
    }

    return {peerConnection, remoteStream};
}

function changeJoinFormState(state) {
    let element = document.getElementById("join_form");
    if(element) {
        element.style.display = state ? "" : "none";
    }
}

async function prepareParticipantConnection(user_id) {

    let creation_result = await createPeerConnection(user_id);
    let answer = await creation_result.peerConnection.createOffer({});
    await creation_result.peerConnection.setLocalDescription(answer);

    return {
        answer,
        pr: {
            name: "unknown user",
            video: false,
            audio: false,
            presenting: false,
            creator: false,
            ...creation_result
        }
    };

}

function setRemoteStreams(ids) {

    ids.forEach(id => {
        let participant_video = document.getElementById(id);
        if(participant_video) {
            participant_video.srcObject = participants.get(id).remoteStream;
        }
    })

}

function createNewParticipant(user_id) {

    let element = document.getElementById("participant_grid");
    element.innerHTML += `
    <div class="col-sm-12 col-md-6 col-lg-4 p-3 rounded-2 mb-2 bg-dark" id="${user_id}_container">
        <video src="" class="participant_video" id="${user_id}" controls></video>
        <div class="w-100 bg-dark d-flex justify-content-between py-2">
            <h5 class="card-title text-white">${user_id}</h5>
            <button class="btn btn-sm btn-light">Focus</button>
        </div>
    </div>
    `;

}