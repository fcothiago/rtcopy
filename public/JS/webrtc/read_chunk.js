const buffer_limit = 100;

function file_to_base64(file)
{
	return new Promise((resolve,reject) => 
	{
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(errot);
		reader.readAsDataURL(file);
	});
}


self.onmessage = async (msg) => 
{
	const start = msg.data.start , end = msg.data.end, chunk_size = msg.data.chunk_size, file = msg.data.file, file_id = msg.data.file_id;
	let buffer = {};
	for(let i = start ; i < end ; i++)
	{
		const slice_start = i*chunk_size;
		const slice_end   = ( (i+1)*chunk_size ) <= file.size ? (i+1)*chunk_size : file.size;
		const slice = file.slice(slice_start,slice_end);
		const data_b64 = ( await file_to_base64(slice) ).split(',')[1]; //remove "data:*/*;base64," prefix
		buffer[i] = [data_b64,slice.size];
		if(Object.keys(buffer).length >= buffer_limit)
		{
			self.postMessage({chunks_base64:buffer,file_id:file_id});
			buffer = {};
		}
		if(slice_end > file.size)
		{
			break;
		}
	}
}
