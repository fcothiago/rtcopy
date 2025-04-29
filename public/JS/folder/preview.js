function filesize_resumed(size)
{
	if(size < 1024)
		return `${size}`;
	if(size < 1024*1024)
		return `${parseInt(size/1024)} KiB`;
	if(size < 1024*1024*1024)
		return `${parseInt(size/1024/1024)} MiB`;
	if(size < 1024*1024*1024*1024)
		return `${parseInt(size/1024/1024/1024)} GiB`;
}

function show_preview(infos)
{
	const filename = document.getElementById('preview-filename');	
	const filesize = document.getElementById('preview-filesize');	
	const filetype = document.getElementById('preview-filetype');
	const fileowner = document.getElementById('preview-fileowner');
	filename.innerHTML = `${infos.name}`;
	filesize.innerHTML = `${filesize_resumed(infos.size)}`;
	filetype.innerHTML = `${infos.type}`;
	fileowner.innerHTML = `${infos.owner}`;
	const preview = document.getElementById('preview-area');
	preview.style.display = '';

}

function add_preview_btn(file_item,infos)
{
	const btn = document.createElement('a');
	const icon = document.createElement('img');
	btn.href = '#';
	icon.src = '/icons/search-svgrepo-com.svg';
	btn.onclick = (e) =>
	{
		e.preventDefault();
		show_preview(infos);
	}
	btn.appendChild(icon);
	file_item.appendChild(btn);
}

function close_preview()
{
	const preview = document.getElementById('preview-area');
	preview.style.display = 'none';
}
