function addExportButton(buttonsgroup,file,exportmanager)
{
	const exportbutton = document.createElement('a');
	exportbutton.href = '#';
	exportbutton.text = 'export file';
	if("showSaveFilePicker" in window )
		exportbutton.onclick = async () => exportToFileStream({
			fileid:file.id,
			file_name:file.name,
			file_type:file.type
		},exportbutton,exportmanager);
	else
		exportbutton.onclick = () => exportToBlobFileURL(file.id,exportbutton,exportmanager);
	buttonsgroup.appendChild(exportbutton);
}

function addRemoveButton(btngroup,file,filedb)
{
	const rmvbutton = document.createElement('a');
	rmvbutton.href = '#';
	rmvbutton.innerHTML = "<img src='/icons/cross-circle-svgrepo-com.svg' class='remove-button'>";
	rmvbutton.onclick = () => {
		onsuccess = (fileid) => document.getElementById(`${fileid}`).remove();
		onerror = () => console.log(`failed to remove file ${file.id}`);
		filedb.removeFile(file.id,onsuccess,onerror);
	};
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

function addFileToDirectory(file,filedb,exportmanager)
{
	const directory = document.getElementById('directory');
	const fileitem = document.createElement('li');
	const buttonsgroup = document.createElement('span');
	fileitem.id = `${file.id}`;
	buttonsgroup.className = "buttons-group";
 	addFileInfos(fileitem,file);
	addRemoveButton(buttonsgroup,file,filedb);
	add_preview_btn(buttonsgroup,file);
	addExportButton(buttonsgroup,file,exportmanager)
	fileitem.appendChild(buttonsgroup);
	directory.appendChild(fileitem);
}

function retriveSavedFiles()
{
	console.log('retriveSavedFiles()');
	let intervalId = null;
	const filedb = new fileDatabase();
	const exportmanager = new exportFileManager();
	const onfilerecived = (file) => addFileToDirectory(file,filedb,exportmanager)
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

