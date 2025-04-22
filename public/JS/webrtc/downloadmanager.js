const CHUNK_COUNT = 100;

function gen_download_key(file_id,dc_id)
{
	return `${dc_id}${file_id}`;
}

function gen_range(start,end)
{
	const range = new Set();
	for(let i = start; i < start+end ; i++)
	{
		range.add(i);
	}
	return range;
}

class blob_file_handler
{
	constructor(mime_type)
	{
		this.file_data = null;
		this.mime_type = mime_type;
		this.worker = new Worker("/JS/webrtc/base64_datajoin.js");
	}

	create_file()
	{
		this.file_data = [];//new Blob([],{type:this.mime_type});
		return true;
	}

	append_datachunks(chunks_b64_array,onFinished,onError)
	{
		this.worker.onmessage = (message) => {
			this.file_data.push(message.data.decoded_data);
			onFinished();
		};
		this.worker.onerror = (e) => {
			console.error(e);
		};
		this.worker.postMessage([chunks_b64_array,this.blob,this.mime_type]);
	}

	finish()
	{
		this.worker.terminate();
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

	async start_download(file_id,dc_id,onDownloadUpdate)
	{
		const key = gen_download_key(file_id,dc_id) , file=this.folder.remote_files.get(dc_id)[file_id];
		const file_size = this.folder.remote_files.get(dc_id)[file_id].size;
		if(this.current_downloads.has(key) || !file)
			return;
		const file_handler = await this.create_file_handler(file);
		if(!file_handler)
			return;
		this.current_downloads.set(key,
		{
			chunks_in_memory : new Map(),
			file_handler : file_handler,
			file_size : file_size,
			waiting_chunks_indexes : gen_range(0,CHUNK_COUNT),
			bytes_recived : 0,
			finished : false,
			download_update_callback : onDownloadUpdate
		});
		this.folder.request_datachunks(0,CHUNK_COUNT,file_id,dc_id);
	}

	recive_datachunk(infos,dc_id)
	{
		const key = gen_download_key(infos.file_id,dc_id);		
		const download = this.current_downloads.get(key);
		if( !download || download.finished || (!download.waiting_chunks_indexes.has(infos.chunk_index)) )
			return;
		download.waiting_chunks_indexes.delete(infos.chunk_index);
		download.bytes_recived += infos.chunk_size;
		download.chunks_in_memory.set(infos.chunk_index,infos.chunk_data);
		if( (download.waiting_chunks_indexes.size == 0) || (download.bytes_recived >= download.file_size))
			this.process_datachunks(infos,download,dc_id);
	}

	process_datachunks(infos,download,dc_id)
	{
		const last_index = [...download.chunks_in_memory.entries()].reduce( (a,b) => a[0] >= b[0] ? a[0] : b[0] );
		const onFinished = () => 
		{
			download.chunks_in_memory.clear() ;
			download.finished = download.bytes_recived >= download.file_size;
			download.download_update_callback(download);
			if(download.finished)
			{
				const key = gen_download_key(infos.file_id,dc_id);		
				this.current_downloads.delete(key);
				return;
			}
			download.waiting_chunks_indexes = gen_range(last_index+1,CHUNK_COUNT);
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
