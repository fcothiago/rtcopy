const path = require('path');
const folders = require('../models/folders');
require('dotenv').config();

function generate_pass(digits)
{
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$%';
	let pass = '';
	for(let i = 0; i < digits;i++)
	{
		let code = Math.floor(Math.random() * charset.length ) ;
		pass += charset[code];
	}
	return pass;
}

exports.getLandingPage = (req,res) => {
	const page_url = process.env.SERVER_URL ? process.env.SERVER_URL : 'http://localhost';
	const port = process.env.PORT; 
	const params = {
		server_url:page_url,
		port:port
	};
	res.render("index", {params} );
}

exports.enterRoom = (req,res) => {
	const folder_name = req.params.name;
	const folder_pass = req.params.pass;
	const page_url = process.env.SERVER_URL ? process.env.SERVER_URL  : 'http://localhost';
	const port = process.env.PORT; 
	if(!folder_pass)
	{
		const pass = generate_pass(8);
		res.redirect(`/folder/${folder_name}/${pass}`);
		return;
	}
	console.log(`Request acess to folder with name ${folder_name} and pass ${folder_pass}`);
	const check = folders.check_folder(folder_name);
	if(!check)
		folders.create_folder(folder_name,folder_pass);
	const params = {
		folder_name:folder_name,
		folder_pass:folder_pass,
		page_url:page_url,
		port:port
	};
	res.render("folder", {params});
}	
