class virtualFolder
{
	constructor()
	{
		this.local_files = [];
		this.remote_files = new Map();
		this.datachannels = new Map();
		this.onCloseDataChannel = (datachannel,id) => {console.log(`Datachannel id ${id} closed`)};
	}

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
		console.log(`Oned datachannel with sock id ${id}`);
		datachannel.send({type:"file_infos",data:this.datachannels});
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

	add_local_file(file)
	{

	}

	add_remote_file(file)
	{

	}

	request_remote_file(file_id)
	{

	}
}
