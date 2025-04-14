const CHUNK_SIZE_BYTES = 1000;

function file_to_base64(file)
{
	return new Promise((resolve,reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(errot);
		reader.readAsDataURL(file);
	});
}

async function get_file_chunks_base64(start,end,chunk_size,file)
{
	let chunks = {};
	for(let i = start ; i < end ; i++)
	{
		const slice = file.slice(i*chunk_size,(i+1)*chunk_size);
		chunks[i] = [await file_to_base64(slice),slice.size];
	}
	return chunks;
}

function stract_file_infos(file,file_id)
{
	return {
			file_id:file_id,
			name:file.name,
			size:file.size
		};
}

class virtualFolder
{
	constructor()
	{
		this.local_files = new Map();
		this.remote_files = new Map();
		this.datachannels = new Map();
		this.onNewLocalFile = (file) => {console.log(`new local file ${file.file_id}`)};
		this.onNewRemoteFile = (file,dc_id) => {console.log(`new remote file ${file.file_id}`)};
		this.onRemoteFileRemoval = (file,dc_id) => {console.log(`removing remote file ${file.file_id} from ${dc_id}`)};
		this.onLocalFileRemoval = (file) => {console.log(`removing local file ${file.file_id}`)};
		this.onDatachunkReceived = (infos,dc_id) => {console.log(`recive new datachunk dc ${dc_id} file_id ${infos.file_id} index ${infos.index}`);};
	}

	/*Adding and and Config a new Peer's datachannel*/
	
	//Adds a new data channel]
	add_datachannel(datachannel,dc_id)
	{
		//TODO:Handle new datachannel
		this.datachannels.set(dc_id,datachannel);
		this.remote_files.set(dc_id,{});
		this.handle_open_datachannel(datachannel,dc_id);
	}

	//Handles this.datachannels[id] open event
	handle_open_datachannel(datachannel,dc_id)
	{
		console.log(`Opened datachannel with sock id ${dc_id}`);
		const message = JSON.stringify({code:'send_local_files_infos'});
		datachannel.send(message);
	}
	
	//Handles data sent by this.datachannel[id]. 
	handle_datachannel_message(message,dc_id)
	{
		const obj = JSON.parse(message);
		const code = obj.code;
		const code_handlers = {
			set_remote_files_infos : (data,dc_id) => this.add_remote_files(data,dc_id),
			del_remote_files : (data,dc_id) => this.delete_remote_files(data,dc_id),
			send_local_files_infos : (data,dc_id) => this.send_local_files_infos(dc_id),
			send_datachunks: (data,dc_id) => this.send_datachunks(data,dc_id),
			recive_datachunk: (data,dc_id) => this.recive_datachunk(data,dc_id),
			peer_warning : (data,dc_id) => console.log(`peer message ${data}`)
		};
		//TODO:Handle a invalid code
		code_handlers[code](obj.data,dc_id);
	}

	/* Adding files and notify current peers */
	
	//Send data to all remote peers
	broadcast_data(data)
	{
		const data_ = JSON.stringify(data);
		this.datachannels.forEach((dc,key) => {
			dc.send(data_);
		})
	}
	
	add_local_files(files)
	{
		let files_infos = {};
		for(const [i] in Object.entries(files))
		{
			const file = files[i] , file_id = crypto.randomUUID();
			this.local_files.set(file_id,file);
			files_infos[file_id] = stract_file_infos(file,file_id);
			this.onNewLocalFile(files_infos[file_id]);
		}
		const message = { 
			code:'set_remote_files_infos',
			data:files_infos 
		};
		this.broadcast_data(message);
	}

	//Remove one or more local files with id in the list fil_ids and notify all peers about removal.
	delete_local_files(file_ids)
	{
		for(const index in file_ids)
		{
			const id = file_ids[index];
			this.local_files.delete(id);
		}
		const message = {
			code:'del_remote_files',
			data:file_ids
		};
		this.broadcast_data(message);
	}

	//Sends all local files infos to a peer
	send_local_files_infos(dc_id)
	{
		const data = {};
		this.local_files.forEach((file,file_id) => {
			data[file_id] = stract_file_infos(file,file_id);
		});
		//TODO:Handle if there is no dc_id in this.datachannels
		const message = JSON.stringify({
			code:'set_remote_files_infos',
			data:data
		});
		this.datachannels.get(dc_id).send(message);
	}

	/*Recive peers notifications*/
	add_remote_files(files,dc_id)
	{
		for(const [file_id,file] of Object.entries(files))
		{
			this.remote_files.get(dc_id)[file_id] = file;
			this.onNewRemoteFile(file,dc_id);
		}
	}

	delete_remote_files(file_ids,dc_id)
	{
		for(const index in file_ids)
		{
			const file_id = file_ids[index];
			const file = structuredClone(this.remote_files.get(dc_id)[file_id]);
			this.onRemoteFileRemoval(file,dc_id);
			delete this.remote_files.get(dc_id)[file_id];
		}
	}
	/*Sending/reciving Datachunks*/
	request_datachunks(start,chunks,file_id,dc_id)
	{
		const dc = this.datachannels.get(dc_id);
		const infos = {
			file_id:file_id,
			start:start,
			chunks:chunks
		};
		const message = JSON.stringify({
			code:'send_datachunks',
			data:infos
		});
		dc.send(message);
	}

	async send_datachunks(infos,dc_id)
	{
		const file = this.local_files.get(infos.file_id);
		const datachannel = this.datachannels.get(dc_id);
		const start = infos.start , end = infos.start + infos.chunks;
		const chunks_base64 = await get_file_chunks_base64(start,end,CHUNK_SIZE_BYTES,file);	
		for(const [chunk_index,chunk_infos] of Object.entries(chunks_base64))
		{
			const [chunk_b64,chunk_size] = chunk_infos;
			const data = {
				file_id:infos.file_id,	
				chunk_index:chunk_index,
				chunk_size:chunk_size,
				chunk_data:chunk_b64,
			};
			const message = JSON.stringify({
				code:'recive_datachunk',
				data:data
			});
			datachannel.send(message);
		}
	}

	recive_datachunk(infos,dc_id)
	{
		this.onDatachunkRecived(infos,dc_id);
	}
}
