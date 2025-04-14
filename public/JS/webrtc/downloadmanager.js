const CHUNK_COUNT = 100;

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

class downloadManager
{
	constructor(folder)
	{
		this.folder = folder; 
		this.current_downloads = new Map();
		this.onChunkRecived = (infos,worker_id) => {console.log(`${worker_id} recived new chunck`)};
		this.onFinish = (infos,worker_id) => {console.log(`${worker_id} finished download`)};i
	}

	start_download(file_id,dc_id)
	{
		const key = gen_download_key(file_id,dc_id);
		if(this.current_downloads.has(key))
			return;
		this.current_downloads.set(key,
		{
			chunks_in_memory : {},
			blob_file : null,
			waiting_chunk_indexes : gen_range(CHUNK_COUNT),
			bytes_recived : 0
		});
		this.folder.request_datachunks(0,CHUNK_COUNT,file_id,dc_id);
	}

	recive_datachunk(infos,dc_id)
	{
		const key = gen_download_key(infos.file_id,dc_id);
		if(!this.current_downloads.has(key))
			return;
		const chunk = this.current_downloads.get(key);
		chunk.waitin_chunk_indexes.delete(infos.chunk_index);
		chunk.bytes_recived += infos.chunk_size;
		chunk.chunks_in_memory[infos.chunk_index] = infos.chunk_data;
		if(Object.entries(chunk.chunks_in_memory).length >= CHUNK_COUNT)
		{
			console.log(`Process data chunk ${infos.file_id} ${dc_id}`);
		}
	}

	process_datachunk()
	{
		
	}
}
