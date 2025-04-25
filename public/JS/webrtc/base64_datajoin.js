function base64_to_uint8array(chunks_b64_array)
{
	const parsed_chunks_array = chunks_b64_array.map( (chunk_b64) => atob(chunk_b64) );
	const full_chunk_length = parsed_chunks_array.reduce( (sum,arr) => sum + arr.length  , 0 )
	const full_chunk = new Uint8Array(full_chunk_length);
	let index = 0;
	for(const chunk of parsed_chunks_array)
	{
		for(let i = 0; i < chunk.length ; i++)
		{
			full_chunk[index] = chunk.charCodeAt(i);
			index += 1;
		}
	}
	return full_chunk;  
}

function get_sorted_map(map)
{
	const entries = [...map.entries()];
	return entries.sort((a,b) => a[0] - b[0]);
}

self.onmessage = (e) => {
	const [chunks_b64,blob_file,mime_type] = e.data;
	if(!chunks_b64)
		return;
	const chunks_b64_sorted = get_sorted_map(chunks_b64) , chunks_b64_array = [];
	for(const [key,value] of chunks_b64_sorted)
	{
		chunks_b64_array.push(value);
	}
	const bytes = base64_to_uint8array(chunks_b64_array); 
	//const new_blob = new Blob([blob_file,bytes],{type:mime_type});
	self.postMessage({finished:true,decoded_data:bytes});
};
