function initclient(folder_name,folder_pass,server_url)
{
	const socket = io(server_url);
	const client = new signalingClient(socket,folder_name,folder_pass);
	const vfolder = new virtualFolder();
	const manager = new downloadManager(vfolder);

	const peers_counter = document.getElementById('peers-count');

	client.onDataChannelOpen = (datachannel,id) => 
	{	
		vfolder.add_datachannel(datachannel,id);
		peers_counter.innerHTML = `${vfolder.datachannels.size}`;
	}
	client.onDataChannelMessage = (message,id) => vfolder.handle_datachannel_message(message,id);
	client.onDataChannelClose = (dc_id) =>
	{	
		vfolder.remove_datachannel(dc_id);
		const query = document.querySelectorAll(`.remote-file-${dc_id}`);
		query.forEach( element => {element.remove()});
		peers_counter.innerHTML = `${vfolder.datachannels.size}`;
	}
	
	const files_counter = document.getElementById('files-count');

	vfolder.onDatachunkRecived = (infos,dc_id) => manager.recive_datachunk(infos,dc_id);
	document.getElementById('fileinput').addEventListener('change', (event) => 
	{
		if(event.target.files)
			vfolder.add_local_files(event.target.files);
	});
	vfolder.onNewRemoteFile = (file,dc_id) => 
	{
		files_counter.innerHTML = `${vfolder.total_files}`;	
		add_remotefile(file,dc_id,vfolder,manager);
	}
	vfolder.onNewLocalFile = (file) => 
	{
		files_counter.innerHTML = `${vfolder.total_files}`;	
		add_localfile(file,vfolder);
	}
	vfolder.onRemoteFileRemoval = (file,dc_id) => 
	{
		manager.delete_download(file.file_id,dc_id);
		const query = document.querySelectorAll(`.remote-file-${dc_id}#remote-${file.file_id}`);
		query.forEach( element => {element.remove()});
		files_counter.innerHTML = `${vfolder.total_files}`;	
	};
	vfolder.onLocalFileRemoval = (file_id) => 
	{
		document.getElementById(`local-${file_id}`).remove();
		files_counter.innerHTML = `${vfolder.total_files}`;	
	};

	client.init_signaling_client();
}
