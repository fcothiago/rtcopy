/*Folder Class Model*/
class folder_manager{
	constructor(name,pass,sockid){
		this.name = name;
		this.pass = pass;
		this.creator_socket = sockid;
		this.users = [];
	}

	add_user(id,pass){
		console.log(`${this.pass} ${pass}`)
		if (this.pass && this.pass != pass)
			return false;
		this.users.push(id)
		return true;
	};

	remove_user(id){

	};
};

/*Maps a name with each folder*/
const foldersname_map = new Map();

/*Maps a socket id with a folder name*/
const sockid_map = new Map();

exports.check_folder = (name) =>{
	return foldersname_map.has(name);
};

exports.create_folder = (name,pass) => {
	const folder = new folder_manager(name,pass)
	foldersname_map.set(name,folder); 
	console.log(`New folder created with name ${name} and pass ${pass}`);
};

exports.enter_folder = (name,pass,sockid) => {
	const folder = foldersname_map.get(name);
	if(!folder)
		return false;
	return folder.add_user(sockid,pass);
}

exports.remove_folder = (name) => {

};

