const CHUNK_COUNT = 100;

function base64_to_Uint8array(chunks_b64_array)
{
	const full_chunk = chunks_b64_array.join("");
	const bytes = new Uint8Array(full_chunk.length);
	for(let i = 0; i < full_chunk.length; i++)
	{
		bytes[i] = full_chunk.charCodeAt(i);
	}
	return bytes;
}

function gen_download_key(file_id,dc_id)
{
	return `${dc_id}${file_id}`;
}

function gen_range(n)
{
	const range = new Set();
	for(let i = 0; i < n ; i++)
	{
		range.add(i);
	}
	return range;
}

class blob_file_handler
{
	constructor(mime_type)
	{
		this.blob_file = null;
		this.mime_type = mime_type;
	}

	create_file()
	{
		this.blob = new Blob([],{type:this.mime_type});
		return true;
	}

	append_datachunks(chunks_b64_array)
	{
		const parsed_data = base64_to_Uint8array(chunks_b64_array);
		this.blob = new Blob([this.blob,parsed_data],{type:this.mime_type});
	}

	download_file()
	{

	}
}


class stream_file_handler
{
	constructor()
	{
		this.stream_file = null;
	}

	async create_file()
	{

	}

	append_datachunks(chunks)
	{

	}

	download_file()
	{

	}
}

class downloadManager
{
	constructor(folder)
	{
		this.folder = folder; 
		this.current_downloads = new Map();
		this.onChunkRecived = (infos,worker_id) => {console.log(`${worker_id} recived new chunck`)};
		this.onFinish = (infos,worker_id) => {console.log(`${worker_id} finished download`)};
	}

	async create_file_handler(file)
	{
		const mime_type = file.type;
		const handler = 'showSaveFilePicker' in window ? new stream_file_handler(mime_type) : new blob_file_handler(mime_type);
		const flag = await handler.create_file();
		return flag ? handler : null;
	}

	async start_download(file_id,dc_id)
	{
		const key = gen_download_key(file_id,dc_id) , file=this.folder.remote_files.get(dc_id)[file_id];
		if(this.current_downloads.has(key) || !file)
			return;
		const file_handler = await this.create_file_handler(file);
		if(!file_handler)
		{
			console.log('Failed to create file');
			return;
		}
		this.current_downloads.set(key,
		{
			chunks_in_memory : {},
			file_handler : file_handler,
			waiting_chunk_indexes : gen_range(CHUNK_COUNT),
			next : 0
		});
		this.folder.request_datachunks(0,CHUNK_COUNT,file_id,dc_id);
	}

	recive_datachunk(infos,dc_id)
	{
		const key = gen_download_key(infos.file_id,dc_id),download = this.current_downloads.get(key);
		if(!download)
			return;
		if(download.waiting_chunk_indexes.delete(infos.chunk_index))
			download.bytes_recived += infos.chunk_size;
		download.chunks_in_memory[infos.chunk_index] = infos.chunk_data;
		if(download.bytes_recived)
			return;//Finish download
		if(Object.entries(download.chunks_in_memory).length >= CHUNK_COUNT)
			this.process_datachunks(download);	
	}

	process_datachunks(download)
	{
		console.log('process_datachunks');
		const worker = new Worker("/JS/webrtc/download_worker.js");
		const last_index = Object.entries(download.chunks_in_memory).reduce( (a,b) => a > b ? a : b );
		worker.onmessage = (message) => {

		};
		worker.onerror = (e) => {
			console.error(e);
		};
		worker.postMessage(download);
	}

	handle_missing_chunks()
	{
		
	}
}
