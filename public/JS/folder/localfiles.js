function add_remove_btn(localfile_item,folder)
{
	const remove_btn = document.createElement('a');
	remove_btn.href = '#';
	remove_btn.innerHTML = 'remove';
	remove_btn.onclick = (e) => 
	{
		e.preventDefault();
		folder.delete_local_files([file.file_id]);
		localfile_item.remove();
	};
	localfile_item.appendChild(remove_btn);
}

function add_localfile_infos(localfile_item,file)
{
	const file_name = document.createElement('span');
	file_name.innerHTML = `${file.name}`;
	localfile_item.appendChild(file_name);
}

function add_localfile(file,dc_id,folder)
{
	const directory = document.getElementById('directory');
	const localfile_item = document.createElement('li');
	add_localfile_infos(localfile_item,file);
	add_remove_btn(localfile_item,folder);
	localfile_item.className = `local-file`;
	localfile_item.id = `local-${file.file_id}`;
	directory.appendChild(localfile_item);
}
