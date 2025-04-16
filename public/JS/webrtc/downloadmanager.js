const CHUNK_COUNT = 1000;

function gen_download_key(file_id,dc_id)
{
	return `${dc_id}${file_id}`;
}

function gen_range(start,end)
{
	const range = new Set();
	for(let i = start; i < end ; i++)
	{
		range.add(i);
	}
	return range;
}

class blob_file_handler
{
	constructor(mime_type)
	{
		this.blob = null;
		this.mime_type = mime_type;
		this.worker = new Worker("/JS/webrtc/blobfile_join.js");
	}

	create_file()
	{
		this.blob = new Blob([],{type:this.mime_type});
		return true;
	}

	append_datachunks(chunks_b64_array,onFinished,onError)
	{
		this.worker.onmessage = (message) => {
			this.blob = message.data.blob;
			onFinished();
		};
		this.worker.onerror = (e) => {
			console.error(e);
		};
		this.worker.postMessage([chunks_b64_array,this.blob,this.mime_type]);
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
			waiting_chunk_indexes : gen_range(0,CHUNK_COUNT),
			bytes_recived : 0,
			finished : false
		});
		this.folder.request_datachunks(0,CHUNK_COUNT,file_id,dc_id);
	}

	recive_datachunk(infos,dc_id)
	{
		const key = gen_download_key(infos.file_id,dc_id);		
		const download = this.current_downloads.get(key);
		const file_size = this.folder.remote_files.get(dc_id)[infos.file_id].size;
		if( (!download) || download.finished)
			return;
		if(download.waiting_chunk_indexes.delete(infos.chunk_index) )
			return;
		download.bytes_recived += infos.chunk_size;
		download.chunks_in_memory[infos.chunk_index] = infos.chunk_data;

		if(Object.entries(download.chunks_in_memory).length >= CHUNK_COUNT || download.bytes_recived >= file_size)
			this.process_datachunks(infos,download,dc_id);
	}

	process_datachunks(infos,download,dc_id)
	{
		const file_size = this.folder.remote_files.get(dc_id)[infos.file_id].size;
		const last_index = Object.entries(download.chunks_in_memory).reduce( (a,b) => a > b ? a : b );
		const onFinished = (e) => 
		{
			if(download.bytes_recived >= file_size)
			{	
				console.log('finished download');
				const url = URL.createObjectURL(download.file_handler.blob);
				const a = document.createElement("a");
				a.href = url;
				a.innerHTML = "download";
				document.body.appendChild(a);
				download.finished = true;
				return;//Finish download
			}
			this.folder.request_datachunks(last_index+1,CHUNK_COUNT,infos.file_id,dc_id);	
		};
		const onError = (e) => {

		};
		download.file_handler.append_datachunks(download.chunks_in_memory,onFinished,onError);
	}

	handle_missing_chunks()
	{
		
	}
}
