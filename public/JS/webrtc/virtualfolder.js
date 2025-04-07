class virtualFolder
{
	constructor()
	{
		this.local_files = new Map();
		this.remote_files = new Map();
		this.datachannels = new Map();
		this.onCloseDataChannel = (datachannel,id) => {console.log(`Datachannel id ${id} closed`)};
	}

	/*Adding and and Configing a new Peer's datachannel*/
	
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

	handle_open_datachannel(datachannel,id)
	{
		console.log(`Opened datachannel with sock id ${id}`);
		const data = JSON.stringify({type:"request_files"});
		datachannel.send(data);
	}

	handle_datachannel_message(data,id)
	{
		console.log(`Recive message from ${id} - ${data}`);
	}

	handle_datachannel_status_change()
	{
		
	}

	setup_datachannel(datachannel,id)
	{
		//TODO:Config events of a new datachannel
	}

	/*Adding files and notifing current peers*/

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
			files_infos[file_id] = {id:file_id,name:file.name};
		}
		this.broadcast_data(files_infos);
	}

	/*Reciving peers notifications*/

	/*Requesting and Sending files*/
}
