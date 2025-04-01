const folders = require("../models/folders");

function handle_socket_connection(socket)
{
	console.log(`New websocket connection: ${socket.id}`);
	/*Handles a socket trying to join a folder*/
	socket.on('join-folder',(params) => {
		const name = params.folder_name , pass = params.folder_pass;
		const check = folders.enter_folder(name,pass);
		if(check)
			socket.join(name);
		socket.emit("joined-folder",{result:check});	
		console.log( check ? `${socket.id} entered room ${name}` : `${socket.id} entered room ${name} failed` )
	});
	/*Handles a socket disconecting/leaving a room*/
	socket.on('disconnect',() => {});
	/*Handles user peers request*/
	socket.on('peer-request',(params) => {
		console.log(`peer request from ${socket.id}. Broadicasting to ${params.folder_name}`);
		const folder_name = params.folder_name;
		socket.to(folder_name).emit("peer-request",{origin:socket.id});
	});
	/*Handles user sending webrtc offer*/
	socket.on('rtc-offer',(params) =>{
		const offer = params.offer , reciver = params.reciver;
		socket.to(reciver).emit("rtc-offer",{offer:offer,origin:socket.id});
	});
	/*Handles user sending webrtc answer*/
	socket.on('rtc-answer',(params) =>{
		const answer = params.answer , reciver = params.reciver;
		socket.to(reciver).emit("rtc-answer",{answer:answer,origin:socket.id});
	});
	/*Handles user sending ice-candidate*/
	socket.on('rtc-icecandidate',(params) =>{
		console.log(`sending ice-candidate ${socket.id} -> ${params.reciver}`);
		const icecandidate = params.icecandidate , reciver = params.reciver;
		socket.to(reciver).emit("rtc-icecandidate",{icecandidate:icecandidate,origin:socket.id});
	});
}


module.exports = {handle_socket_connection};
