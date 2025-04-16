function base64_to_Uint8array(chunks_b64_array)
{
	const full_chunk = atob(chunks_b64_array.join("");
	const bytes = new Uint8Array(full_chunk.length);
	for(let i = 0; i < full_chunk.length; i++)
		bytes[i] = full_chunk.charCodeAt(i);
	return bytes;
}

self.onmessage = (e) => {
	console.log('joining blob');
	const [chunks_b64,blob_file,mime_type] = e.data;
	const chunks_b64_array = [];
	for(let [i] in Object.entries(chunks_b64).sort())
	{
		console.log(i);
		chunks_b64_array.push(chunks_b64[i]);
	}
	const bytes = base64_to_Uint8array(chunks_b64_array); 
	const new_blob = new Blob([blob_file,bytes],{type:mime_type});
	self.postMessage({finished:true,blob:new_blob});
};
