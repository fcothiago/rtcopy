const folders = require("../models/folders");

function handle_socket_connection(socket)
{
	console.log(`New websocket connection: ${socket.id}`);
	/*Handles a socket trying to join a folder*/
	socket.on('join-folder',(room,pass) => {});
	/*Handles a socket disconecting/leaving a room*/
	socket.on('disconnect',() => {});
	/*Handles user sending webrtc offer*/
	socket.on('rtc-offer',(offer,to) =>{});
	/*Handles user sending webrtc answer*/
	socket.on('rtc-answer',(offer,to) =>{});
	/*Handles user sending ice-candidate*/
	socket.on('rtc-icecandidate',(offer,to) =>{});
}

module.exports = {handle_socket_connection};
