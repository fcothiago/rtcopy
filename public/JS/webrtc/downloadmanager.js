class downloadManager
{
	constructor(folder)
	{
		this.folder = folder;
		this.workers = new Map();
		this.blob_files = new Map();
		this.busy_datachannels = new Map();
		this.onChunkRecived = (infos,worker_id) => {console.log(`${worker_id} recived new chunck`)};
		this.onFinish = (infos,worker_id) => {console.log(`${worker_id} finished download`)};
	}

	start_download(file_id,dc_id)
	{
		const worker_id = crypto.randomUUID();
		return worker_id;
	}
}
