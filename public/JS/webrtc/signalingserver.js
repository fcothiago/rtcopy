const RTCPeerConn_configs = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun01.sipphone.com' },
    { urls: 'stun:stun.ekiga.net' },
    { urls: 'stun:stun.fwdnet.net' },
    { urls: 'stun:stun.ideasip.com' },
    { urls: 'stun:stun.iptel.org' },
    { urls: 'stun:stun.rixtelecom.se' },
    { urls: 'stun:stun.schlund.de' },
    { urls: 'stun:stunserver.org' },
    { urls: 'stun:stun.softjoys.com' },
    { urls: 'stun:stun.voiparound.com' },
    { urls: 'stun:stun.voipbuster.com' },
    { urls: 'stun:stun.voipstunt.com' },
    { urls: 'stun:stun.voxgratia.org' },
    { urls: 'stun:stun.xten.com' }
  ]
};

//TODO:Check variables naming. Maybe it's better to padronize termos like reciver and sender
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
	const peer = new RTCPeerConnection(RTCPeerConn_configs);
	peer.onicecandidate = (event) => {
		if(event.candidate)
			socket.emit("rtc-icecandidate",{reciver:reciver,icecandidate:event.candidate});
	};
	const datachannel =  await peer.createDataChannel("datachannel", { negotiated: true, id: 0,  } );
	return [peer,datachannel];
}

async function handle_peer_request(socket,reciver,remote_peers)
{
	const [peer,datachannel] = await create_peer(socket,reciver);
	const offer = await setup_offer(peer);
	remote_peers.set(reciver,peer);
	socket.emit("rtc-offer",{offer:offer,reciver:reciver});
	return [peer,datachannel];
}

async function handle_peer_offer(socket,offer,reciver,remote_peers)
{
	const [peer,datachannel] = await create_peer(socket,reciver);
	await peer.setRemoteDescription(offer);
	const answer = await setup_answer(peer,offer);
	remote_peers.set(reciver,peer);
	socket.emit("rtc-answer",{reciver:reciver,answer:answer});
	return [peer,datachannel]
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
		this.onJoinFolderError = (result) => {console.log(`onJoinFolderError`)};
		this.onPeerRequestError = (error) => {console.log(`onPeerRequestError`)};
		this.onRtcOfferError = (error) => {console.log(`onRtcOfferError ${error}`)};
		this.onRtcAnswerError = (error) => {console.log(`onRtcAnswerError ${error}`)};	
		this.onIcecandidateError = (error) => {console.log(`onIcecandidateError ${error}`)};
		this.onDataChannelOpen = (datachannel,id) => {console.log("onDataChannelCreation")};
		this.onDataChannelMessage = (message,id) => {console.log("onDataChannelMessage")};
		this.onDataChannelClose = (peer_sock_id) => {console.log("onDataChannelClose")};
	}

	setup_datachannel(datachannel,sock_id)
	{
		datachannel.onopen = (event) => {
			this.onDataChannelOpen(datachannel,sock_id);
		};
		datachannel.onmessage = (event) => {
			this.onDataChannelMessage(event.data,sock_id);
		};
		datachannel.onclose = () =>{
			this.onDataChannelClose(sock_id);
		}
	}

	init_signaling_client()
	{
		this.socket.on("joined-folder", (result) => {
			if(!result)
			{
				this.onJoinfolderError(result)
			}
			this.socket.emit("peer-request",{folder_name:this.folder_name});
		});

		this.socket.on("peer-request", async (params) =>{
			console.log(`Recived peer request from ${params.origin}`);	
			const reciver = params.origin;
			try{
				const [peer,datachannel] = await handle_peer_request(this.socket,reciver,this.peers);
				this.setup_datachannel(datachannel,reciver);
			}catch(error){
				this.onPeerRequestError(error);
			}
		});

		this.socket.on("rtc-offer", async (params) =>{
			console.log(`Recived offer from ${params.origin}`);	
			const reciver = params.origin;
			const offer = params.offer;
			try{
				const [peer,datachannel] = await handle_peer_offer(this.socket,offer,reciver,this.peers)
				this.setup_datachannel(datachannel,reciver);
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

		this.socket.emit("join-folder",{folder_name:this.folder_name,folder_pass:this.folder_pass});
	}

}
