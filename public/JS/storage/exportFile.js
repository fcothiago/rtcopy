function joinUint8Array(array1,array2):
{
	const joinedArray = new Uint8Array(array1.length+array2.length);
	joinedArray.set(array1,0);
	joinedArray.set(array2,array.length);
	return joinedArray;
}

class exportFileManager
{
	constructor()
	{
		this.filedb = new fileDatabase();
		this.currentexport = new Map();
		this.filedb.initDatabase();
		this.saveinmemory = false;
	}

	startExport(fileid,onchunkrecived,onfinished)
	{
		onsuccess = (file) => 
		{
			this.currentexport.set(fileid,{data:new Uint8Array(),type:file.type,bytesrecived:0});
			updateexport = (chunk) => 
			{
				let item = this.currentexport.get(fileid);
				item.bytesrecived += chunk.length;
				if(this.saveinmemory)
					item.data = joinUint8Array(item.data,chunk.chunk);
				this.currentexport.set(fileid,item);
			};
			chunkonsuccess = (chunk) => 
			{ 
				updateexport(chunk);
				onchunkrecived(chunk);
			};
			this.filedb.getChunks(id,onchunkrecived,(e) => console.log(`failed to get chunks from file id ${fileid}`));
		};
		this.filedb.getFile(fileid,onsuccess,(e) => console.log(`failed to get file ${fileid}`));
	}
}
