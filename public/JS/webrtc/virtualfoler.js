class virtualfolder
{
	constructor()
	{
		this.local_files = [];
		this.remote_files = new Map();
		this.datachannels = new Map();
		this.onCloseDataChannel = (datachannel,id) = {console.log(`Datachannel id ${id} closed`)};
	}

	add_datachannel(datachannel,id)
	{
		//TODO:Handle new datachannel
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
