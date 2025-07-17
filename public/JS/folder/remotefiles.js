function add_remotefile_infos(remote_file_item,file,dc_id)
{
	const file_infos = document.createElement('div');
	const icon = document.createElement('img');
	const file_name = document.createElement('span');
	file_name.innerHTML = `${file.name}`;
	icon.src = '/icons/cloud-svgrepo-com.svg';
	icon.alt = 'remote file';
	file_infos.classname = `remote-file ${dc_id}`;
	file_infos.appendChild(icon);
	file_infos.appendChild(file_name);
	remote_file_item.appendChild(file_infos);
}

function exportToBlobFileURL(fileid,request_btn,export_manager)
{
	request_btn.text = `0%`;
	request_btn.onclick = () => {};
	export_manager.saveinmemory = true;
	const exportupdate = (chunk,item) => {
		const progress = Math.floor(100*item.bytesrecived/item.size);
		request_btn.text = `${progress}%`;
	};
	const exportfinished = (item) => {
		const blob = new Blob(item.data, { type: item.type });
		const icon = document.createElement('img');
		request_btn.text = ``;
		icon.src = '/icons/play-button-svgrepo-com.svg';
		icon.alt = 'play file';
		request_btn.href = URL.createObjectURL(blob);
		request_btn.appendChild(icon);
	};
	export_manager.startExport(fileid,exportupdate,exportfinished);

}

async function getWritableStream(name,type)
{
	try
	{
		const handler = await window.showSaveFilePicker({suggestedName:name});
		return await handler.createWritable();
	}
	catch(err)
	{
		return null;
	}
}

async function exportToFileStream(download,request_btn,export_manager)
{
	request_btn.text = `0%`;
	request_btn.onclick = () => {};
	export_manager.saveinmemory = false;
	const writablestream = await getWritableStream(download.file_name,download.file_type);
	const exportupdate = async (data,item) => {
		await writablestream.write({
			type : "write",
			position : item.bytesrecived - data.chunk.length,
			data : data.chunk
		});
		const progress = Math.floor(100*item.bytesrecived/item.size);
		request_btn.text = `${progress}%`;
	};
	const exportfinished = async (item) => {
		request_btn.text = ``;
		const icon = document.createElement('img');
		icon.src = '/icons/check-circle-svgrepo-com.svg';
		icon.alt = 'export done';
		request_btn.appendChild(icon);
		await writablestream.close()
	};
	export_manager.startExport(download.fileid,exportupdate,exportfinished);
}

function handle_chunks_update(request_btn,file,dc_id,download_manager,export_manager)
{
	return (download) => 
	{
		if(!download.finished)
		{
			request_btn.innerHTML = `${parseInt(100*(download.bytes_recived/download.file_size))}%`;
			return;
		}
		request_btn.text = `export`;
		request_btn.onclick = "showSaveFilePicker" in window ? async () => exportToFileStream(download,request_btn,export_manager) : () => exportToBlobFileURL(download.fileid,request_btn,export_manager);
	};
}

function handle_request_btn_click(request_btn,file,dc_id,download_manager,export_manager)
{
	return async (e) =>
	{
		e.preventDefault();
		request_btn.onclick = () => {};
		const chunk_update_callback = handle_chunks_update(request_btn,file,dc_id,download_manager,export_manager);
		await download_manager.start_download(file.file_id,dc_id,chunk_update_callback);
		request_btn.innerHTML = "0%";
	};
}

function add_remotefile_request_btn(remote_file_item,file,dc_id,download_manager,export_manager)
{
	const request_btn = document.createElement('a');
	request_btn.href = '#';
	request_btn.innerHTML = 'request';
	request_btn.onclick = handle_request_btn_click(request_btn,file,dc_id,download_manager,export_manager);
	request_btn.innerHTML = "<img src='/icons/download-minimalistic-svgrepo-com.svg' class='download-button' alt='request file'>";
	remote_file_item.appendChild(request_btn);
}

function add_remotefile(file,dc_id,folder,download_manager,export_manager)
{
	const directory = document.getElementById('directory');
	const remote_file_item = document.createElement('li');
	const buttons_group = document.createElement('span');
	add_remotefile_infos(remote_file_item,file,dc_id);
	add_preview_btn(buttons_group,{
		...file,
		owner:dc_id
	});
	add_remotefile_request_btn(buttons_group,file,dc_id,download_manager,export_manager);
	remote_file_item.className = `remote-file-${dc_id}`;
	remote_file_item.id = `remote-${file.file_id}`;
	buttons_group.className = 'buttons-group';
	remote_file_item.appendChild(buttons_group);
	directory.appendChild(remote_file_item);
}
