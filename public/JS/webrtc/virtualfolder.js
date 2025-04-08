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
		this.onNewRemoteFile = (file,dc_id) => {console.log(`new remote file ${file}`)};
	}

	/*Adding and and Config a new Peer's datachannel*/
	
	//Adds a new data channel
	add_datachannel(datachannel,dc_id)
	{
		//TODO:Handle new datachannel
		console.log(`Adding datachannel to socket id ${dc_id}`);
		this.datachannels.set(dc_id,datachannel);
		this.remote_files.set(dc_id,{});
		this.handle_open_datachannel(datachannel,dc_id);
	}

	//Handles this.datachannels[id] open event
	handle_open_datachannel(datachannel,dc_id)
	{
		console.log(`Opened datachannel with sock id ${dc_id}`);
		const message = JSON.stringify({code:'send_local_files_infos'});
		datachannel.send(message);
	}i
	
	//Handles data sent by this.datachannel[id]. 
	handle_datachannel_message(message,dc_id)
	{
		const obj = JSON.parse(message);
		const code = obj.code;
		const code_handlers = {
			set_remote_files_infos : (data,dc_id) => this.add_remote_files(data,dc_id) ,
			del_remote_file : (data,dc_id) => this.remove_remote_file(data,dc_id),
			send_local_files_infos : (data,dc_id) => this.send_local_files_infos(dc_id) ,
			peer_warning : (data,dc_id) => console.log(`peer message ${data}`)
		};
		//TODO:Handle a invalid code
		code_handlers[code](obj.data,dc_id);
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

	remove_local_files(file)
	{

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
	
	add_remote_files(files,dc_id)
	{
		for(const [file_id,file] of Object.entries(files))
		{
			this.remote_files.get(dc_id)[file_id] = file;
			this.onNewRemoteFile(file,dc_id);
		}
	}

	remove_remote_files(file_ids,dc_id)
	{

	}

	/*Requesting and Sending files*/
}
