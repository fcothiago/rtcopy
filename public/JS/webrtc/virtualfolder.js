const CODES = {
	set_remote_files_infos : 0,
	del_remote_file  : 1,
	send_local_files_infos : 2,
	peer_warning : 3
};

function stract_file_infos(file,file_id)
{
	return {file_id:file_id,name:file.name}
}

class virtualFolder
{
	constructor()
	{
		this.local_files = new Map();
		this.remote_files = new Map();
		this.datachannels = new Map();
		this.onCloseDataChannel = (datachannel,id) => {console.log(`Datachannel id ${id} closed`)};
	}

	/*Adding and and Config a new Peer's datachannel*/
	
	//Adds a new data channel
	add_datachannel(datachannel,id)
	{
		//TODO:Handle new datachannel
		console.log(`Adding datachannel to socket id ${id}`);
		this.datachannels.set(id,datachannel);
		this.handle_open_datachannel(datachannel,id);
	}

	handle_datachannel_error(id,error)
	{
		
	}
	
	//Handles this.datachannels[id] open event
	handle_open_datachannel(datachannel,id)
	{
		console.log(`Opened datachannel with sock id ${id}`);
		const message = JSON.stringify({code:'send_local_files_infos'});
		datachannel.send(message);
	}
	
	//Handles data sent by this.datachannel[id]. 
	handle_datachannel_message(message,id)
	{
		const obj = JSON.parse(message);
		const code = obj.code;
		const code_handlers = {
			set_remote_files_infos : (data) => console.log('set_remote_files_infos') ,
			del_remote_file : (data) => console.log('set_remote_files_infos') ,
			send_local_files_infos : (data) => this.send_local_files_infos(id) ,
			peer_warning : (data) => console.log(`peer message ${data}`)
		};
		//TODO:Handle a invalid code
		code_handlers[code](obj.data);
	}

	/* Adding files and notify current peers */
	
	//Send data to all remote peers
	broadcast_data(data)
	{
		const data_ = JSON.stringify(data);
		this.datachannels.forEach((dc,key) => {
			dc.send(data_);
		})
	}
	
	add_local_files(files)
	{
		let files_infos = {};
		for(const i in files)
		{
			const file = files[i] , file_id = crypto.randomUUID();
			this.local_files.set(file_id,file);
			files_infos[file_id] = stract_file_infos(file,file_id);
		}
		const data = { 
			code:'set_remote_files_infos',
			data:files_infos 
		};
		this.broadcast_data(data);
	}
	
	//Sends all local files infos to a peer
	send_local_files_infos(dc_id)
	{
		const data = {};
		this.local_files.forEach((file,file_id) => {
			data[file_id] = stract_file_infos(file,file_id);
		});
		//TODO:Handle if there is no dc_id in this.datachannels
		const message = JSON.stringify({
			code:'set_remote_files_infos',
			data:data
		});
		this.datachannels.get(dc_id).send(message);
	}

	/*Reciving peers notifications*/

	/*Requesting and Sending files*/
}
