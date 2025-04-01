const path = require('path');
const folders = require('../models/folders');

exports.getLandingPage = (req,res) => {
	res.sendFile(path.join(__dirname,'..','..','views', 'index.html'));
}

exports.enterRoom = (req,res) => {
	const folder_name = req.params.name;
	const folder_pass = req.params.pass;
	console.log(`Request acess to folder with name ${folder_name} and pass ${folder_pass}`);
	let check;
	if(!folders.check_folder(folder_name))
		folders.create_folder(folder_name,folder_pass);
	const params = {folder_name:folder_name,folder_pass:folder_pass};
	res.render("folder", {params});

}	
