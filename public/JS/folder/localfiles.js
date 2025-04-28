function add_remove_btn(localfile_item,file,folder)
{
	const remove_btn = document.createElement('a');
	const files_count = document.getElementById('files-count');
	remove_btn.href = '#';
	remove_btn.innerHTML = "<img src='/icons/cross-circle-svgrepo-com.svg' class='remove-button'>";
	remove_btn.onclick = (e) => 
	{
		e.preventDefault();
		folder.delete_local_files([file.file_id]);
		localfile_item.remove();
		files_count.innerHTML = `${folder.total_files}`;
	};
	localfile_item.appendChild(remove_btn);
}

function add_localfile_infos(localfile_item,file)
{
	const file_infos = document.createElement('div');
	const icon = document.createElement('img');
	const file_name = document.createElement('span');
	icon.src = '/icons/file-file-type-svgrepo-com.svg';
	icon.alt = 'local file';
	file_name.innerHTML = `${file.name}`;
	file_infos.appendChild(icon);
	file_infos.appendChild(file_name);
	localfile_item.appendChild(file_infos);
}

function add_localfile(file,folder)
{
	const directory = document.getElementById('directory');
	const localfile_item = document.createElement('li');
	add_localfile_infos(localfile_item,file);
	add_remove_btn(localfile_item,file,folder);
	localfile_item.className = `local-file`;
	localfile_item.id = `local-${file.file_id}`;
	directory.appendChild(localfile_item);
}
