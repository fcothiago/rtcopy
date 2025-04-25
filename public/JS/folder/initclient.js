function initclient(folder_name,folder_pass)
{
	const socket = io("http://localhost:7777");
	const client = new signalingClient(socket,folder_name,folder_pass);
	const vfolder = new virtualFolder();
	const manager = new downloadManager(vfolder);

	client.onDataChannelOpen = (datachannel,id) => vfolder.add_datachannel(datachannel,id);
	client.onDataChannelMessage = (message,id) => vfolder.handle_datachannel_message(message,id);
	client.onDataChannelClose = (id) => vfolder.remove_datachannel(id);
	
	vfolder.onDatachunkRecived = (infos,dc_id) => manager.recive_datachunk(infos,dc_id);
	document.getElementById('fileinput').addEventListener('change', (event) => 
	{
		if(event.target.files)
			vfolder.add_local_files(event.target.files);
	});
	vfolder.onNewRemoteFile = (file,dc_id) => add_remotefile(file,dc_id,vfolder,manager);
	vfolder.onNewLocalFile = (file) => add_localfile(file,vfolder);
	vfolder.onRemoteFileRemoval = (file,dc_id) => 
	{
		manager.delete_download(file.file_id,dc_id);
		const query = document.querySelectorAll(`.remote-file-${dc_id}#remote-${file.file_id}`);
		query.forEach( element => {element.remove()});
	};

	client.init_signaling_client();
}
