self.onmessage = (e) => {
	console.log('worker started');
	const download = e.data;
	const chunks_b64 = download.chunks_in_memory , file_handler = download.file_handler , chunks_b64_array = [];
	for(let [i] in Object.entries(chunks_b64).sort())
		chunks_b64_array.push(chunks_b64[i]);
	file_handler.append_datachunks(chunks_b64_array);
	self.postMessage({
		finished:true,
	});
	self.close();
};
