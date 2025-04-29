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

function handle_chunks_update(request_btn,file,dc_id,download_manager)
{
	return (download) => 
	{
		if(!download.finished)
		{
			request_btn.innerHTML = `${parseInt(100*(download.bytes_recived/download.file_size))}%`;
			return;
		}
		const data = download.file_handler.file_data , mime_type = download.file_handler.mime_type;
		const blob = new Blob(data,{type:mime_type});
		const url = URL.createObjectURL(blob);
		request_btn.innerHTML = "<img src='/icons/play-button-svgrepo-com.svg' class='download-button' alt='play/download '>";
		request_btn.href = url;
	};
}

function handle_request_btn_click(request_btn,file,dc_id,download_manager)
{
	return async (e) =>
	{
		e.preventDefault();
		request_btn.onclick = () => {};
		const chunk_update_callback = handle_chunks_update(request_btn,file,dc_id,download_manager);
		await download_manager.start_download(file.file_id,dc_id,chunk_update_callback);
		request_btn.innerHTML = "0%";
	};
}

function add_remotefile_request_btn(remote_file_item,file,dc_id,download_manager)
{
	const request_btn = document.createElement('a');
	request_btn.href = '#';
	request_btn.innerHTML = 'request';
	request_btn.onclick = handle_request_btn_click(request_btn,file,dc_id,download_manager);
	request_btn.innerHTML = "<img src='/icons/download-minimalistic-svgrepo-com.svg' class='download-button' alt='request file'>";
	remote_file_item.appendChild(request_btn);
}

function add_remotefile(file,dc_id,folder,download_manager)
{
	const directory = document.getElementById('directory');
	const remote_file_item = document.createElement('li');
	const buttons_group = document.createElement('span');
	add_remotefile_infos(remote_file_item,file,dc_id);
	add_preview_btn(buttons_group,{
		...file,
		owner:dc_id
	});
	add_remotefile_request_btn(buttons_group,file,dc_id,download_manager);
	remote_file_item.className = `remote-file-${dc_id}`;
	remote_file_item.id = `remote-${file.file_id}`;
	buttons_group.className = 'buttons-group';
	remote_file_item.appendChild(buttons_group);
	directory.appendChild(remote_file_item);
}
