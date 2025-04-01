const folders = require("../models/folders");

function handle_socket_connection(socket)
{
	console.log(`New websocket connection: ${socket.id}`);
	/*Handles a socket trying to join a folder*/
	socket.on('join-folder',(params) => {
		const name = params.folder_name , pass = params.folder_pass;
		const check = folders.enter_folder(name,pass);
		console.log( check ? `${socket.id} entered room ${name}` : `${socket.id} entered room ${name} failed` )
		socket.emit("joined-folder",{result:check});	
	});
	/*Handles a socket disconecting/leaving a room*/
	socket.on('disconnect',() => {});
	/*Handles user sending webrtc offer*/
	socket.on('rtc-offer',(offer,to) =>{});
	/*Handles user sending webrtc answer*/
	socket.on('rtc-answer',(offer,to) =>{});
	/*Handles user sending ice-candidate*/
	socket.on('rtc-icecandidate',(offer,to) =>{});
	/*Handles user adding files to a folder*/
	socket.on('add-files',(files) =>{});
	/*Handles user removing files from a folder*/
	socket.on('rm-files',(files) =>{});

}


module.exports = {handle_socket_connection};
