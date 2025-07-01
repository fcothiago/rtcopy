function addRemoveButtons(btngroup,file)
{
	const rmvbutton = document.createElement('a');
	rmvbutton.href = '#';
	rmvbutton.innerHTML = "<img src='/icons/cross-circle-svgrepo-com.svg' class='remove-button'>";
	btngroup.appendChild(rmvbutton);
}

function addFileInfos(fileitem,file)
{
	const fileinfos = document.createElement('div');
        const filename = document.createElement('span');
	filename.innerHTML = `${file.name}`;
	fileinfos.classname = `file-${file.id}`;
	fileinfos.appendChild(filename);
	fileitem.appendChild(fileinfos);
}

function addFileToDirectory(file)
{
	const directory = document.getElementById('directory');
	const fileitem = document.createElement('li');
	const buttonsgroup = document.createElement('span');
	buttonsgroup.className = "buttons-group";
 	addFileInfos(fileitem,file);
	addRemoveButtons(buttonsgroup,file);
	add_preview_btn(buttonsgroup,file);
	fileitem.appendChild(buttonsgroup);
	directory.appendChild(fileitem);
}

function retriveSavedFiles()
{
	console.log('retriveSavedFiles()');
	let intervalId = null;
	const filedb = new fileDatabase();
	const onfilerecived = (file) => addFileToDirectory(file);
	const onerror = () => console.log("failed to request files");
	const waitdb = () => {
		try
		{
			filedb.getAllFiles(onfilerecived,onerror);
			clearInterval(intervalId);
		}catch{}
	};
	filedb.initDatabase();
	intervalId = setInterval(waitdb,500);
}

