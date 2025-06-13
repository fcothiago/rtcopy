function gen_download_key(file_id,dc_id)
{
	return `${dc_id}${file_id}`;
}

function gen_range(start,end)
{
		const range = new Set();
		for(let i = start; i < start+end ; i++)
			range.add(i);
		return range;
}

function base64_to_uint8array(chunk_b64)
{
	const parsed_chunk = atob(chunk_b64);
	const chunk_length = parsed_chunk.length;
	const full_chunk = new Uint8Array(chunk_length);
	for(let i = 0; i < chunk_length ; i++)
		full_chunk[i] = chunk_b64.charCodeAt(i);
	return full_chunk;
}

class downloadManager
{
	constructor(folder,chunk_count)
	{
		this.folder = folder;
		this.chunk_count = chunk_count;
		this.current_downloads = new Map();
		this.onChunkRecived = (infos,worker_id) => {console.log(`${worker_id} recived new chunck`)};
		this.onFinish = (infos,worker_id) => {console.log(`${worker_id} finished download`)};
		this.filedb = new fileDatabase();
		this.filedb.initDatabase();
	}

	async start_download(file_id,dc_id,onDownloadUpdate)
	{
		const key = gen_download_key(file_id,dc_id);
		const file_infos = this.folder.remote_files.get(dc_id)[file_id];
		if(this.current_downloads.has(key) || !file_infos)
			return;
		const onsuccess = (id) =>
		{
			this.current_downloads.set(key,
			{
				fileid : id,
				next_block_index: this.chunk_count,
				file_size : file_infos.size,
				waiting_chunks_indexes : gen_range(0,this.chunk_count),
				bytes_recived : 0,
				finished : false,
				download_update_callback : onDownloadUpdate
			});
			this.folder.request_datachunks(0,this.chunk_count,file_id,dc_id);
		};
		this.filedb.addFile(file_infos,onsuccess,(e) => console.log(`failed to crete file in db`));
	}

	delete_download(file_id,dc_id)
	{
		const key = gen_download_key(file_id,dc_id); 
		const download = this.current_downloads.get(key);
		if(!download)
			return;
		download.file_handler.finish();
		this.current_downloads.delete(key);
	}
	
	recive_datachunk(infos,dc_id)
	{
		const key = gen_download_key(infos.file_id,dc_id);		
		const download = this.current_downloads.get(key);
		if( !download || download.finished || (!download.waiting_chunks_indexes.has(infos.chunk_index)) )
			return;
		this.updateDownloadInfos(infos,download);
		this.addChunkToDB(infos,dc_id,download);
	}

	updateDownloadInfos(infos,download)
	{
		download.waiting_chunks_indexes.delete(infos.chunk_index);
		download.bytes_recived += infos.chunk_size;
		download.finished = download.bytes_recived >= download.file_size;
	}

	addChunkToDB(infos,dc_id,download)
	{
		try
		{
			const chunkUInt8 = base64_to_uint8array(infos.chunk_data);
			const onsuccess = (e) =>
			{
				if( (download.waiting_chunks_indexes.size == 0) || (download.bytes_recived >= download.file_size))
					this.process_datachunks(infos,download,dc_id);
				download.download_update_callback(download);
			}
			this.filedb.addChunk(download.fileid,chunkUInt8,infos.chunk_index,onsuccess,(e) => console.log('failed to insert chunk'));
		}
		catch(e){console.log('erro adding data chunk');}
	}

	process_datachunks(infos,download,dc_id)
	{
		if(download.finished)
			return;
		download.waiting_chunks_indexes = gen_range(download.next_block_index,this.chunk_count);
		this.folder.request_datachunks(download.next_block_index,this.chunk_count,infos.file_id,dc_id);	
		download.next_block_index += this.chunk_count;
	}

	handle_missing_chunks()
	{
		
	}
}
