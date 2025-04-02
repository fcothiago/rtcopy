//TODO:Check variables naming. Maybe it's better to padronize termos like reciver and sender
async function setup_datachannel(peer,reciver)
{
	const datachannel = peer.createDataChannel("datachannel");
	datachannel.onopen = () => console.log(`opened datachannel with socket id ${reciver}`);
}

async function setup_offer(peer)
{
	const offer = await peer.createOffer();
	await peer.setLocalDescription(offer);
	return offer;
}

async function setup_answer(peer,offer)
{
	const answer = await peer.createAnswer();
	await peer.setLocalDescription(answer);
	return answer;
}

async function create_peer(socket,reciver)
{
	const peer = new RTCPeerConnection();
	peer.onicecandidate = (event) => {
		if(event.candidate)
			socket.emit("rtc-icecandidate",{reciver:reciver,icecandidate:event.candidate});
	};
	await setup_datachannel(peer,reciver);
	return peer;
}

async function handle_peer_request(socket,reciver,remote_peers)
{
	const peer = await create_peer(socket,reciver);
	const offer = await setup_offer(peer);
	remote_peers.set(reciver,peer);
	socket.emit("rtc-offer",{offer:offer,reciver:reciver});
}

async function handle_peer_offer(socket,offer,reciver,remote_peers)
{
	//TODO: Handle whem reciver already exist in remote_peers
	const peer = await create_peer(socket,reciver);
	await peer.setRemoteDescription(offer);
	const answer = await setup_answer(peer,offer);
	remote_peers.set(reciver,peer);
	socket.emit("rtc-answer",{reciver:reciver,answer:answer});
}

async function handle_peer_answer(answer,sender,remote_peers)
{
	//TODO: Handle there is no key sender in remote_peers
	await remote_peers.get(sender).setRemoteDescription(answer);
}


async function handle_icecandidate(icecandidate,sender,remote_peers)
{
	//TODO: Handle there is no key sender in remote_peers
	await remote_peers.get(sender).addIceCandidate(icecandidate);
}


class signalingClient
{
	constructor(socket,folder_name,folder_pass)
	{
		this.socket = socket;
		this.folder_name = folder_name;
		this.folder_pass = folder_pass;
		this.peers = new Map();
		this.init_signaling_client();
		this.onJoinfolderError = (result) => {};
		this.onPeerRequestError = (error) => {};
		this.onRtcOfferError = (error) => {};
		this.onRtcAnswerError = (error) => {};	
		this.onIcecandidateError = (error) => {};	
	}

	init_signaling_client()
	{
		this.socket.on("joined-folder", (result) => {
			if(!result)
			{
				this.onJoinfolderError(result)
			}
			socket.emit("peer-request",{folder_name:this.folder_name});
		});
		this.socket.on("peer-request", async (params) =>{
			console.log(`Recived peer request from ${params.origin}`);	
			const reciver = params.origin;
			try{
				await handle_peer_request(socket,reciver,this.peers);
			}catch(error){
				this.onPeerRequestError(error);
			}
		});
		this.socket.on("rtc-offer", async (params) =>{
			console.log(`Recived offer from ${params.origin}`);	
			const reciver = params.origin;
			const offer = params.offer;
			try{
				await handle_peer_offer(socket,offer,reciver,this.peers)
			}catch(error){
				this.onRtcOfferError(error);
			}
		});
		this.socket.on("rtc-answer", async (params) => {
			console.log(`Recived answer from ${params.origin}`);	
			const reciver = params.origin;
			const answer = params.answer;
			try{
				await handle_peer_answer(answer,reciver,this.peers);
			}catch(error){
				this.onRtcAnswerError(error);	
			}

		});
		this.socket.on("rtc-icecandidate", async (params) => {
			const sender = params.origin , icecandidate = params.icecandidate;
			try{
				await handle_icecandidate(icecandidate,sender,this.peers);
			}catch(error){
				this.onIcecandidateError(error);	
			}
		});
		socket.emit("join-folder",{folder_name:this.folder_name,folder_pass:this.folder_pass});
	}

}
