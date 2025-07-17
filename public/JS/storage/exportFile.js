function joinUint8Array(array1,array2)
{
	const joinedArray = new Uint8Array(array1.length+array2.length);
	joinedArray.set(array1,0);
	joinedArray.set(array2,array1.length);
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
		const onsuccess = (file) => 
		{
			this.currentexport.set(fileid,{data:[],type:file.type,size:file.size,bytesrecived:0,finished:false});
			const updateexport = (data) => 
			{
				let item = this.currentexport.get(fileid);
				if(item.finished)
					return;
				item.bytesrecived += data.chunk.length;
				onchunkrecived(data,item);
				if(this.saveinmemory)
					item.data.push(data.chunk);
				if(item.bytesrecived >= item.size)
				{
					item.finished = true;
					onfinished(item);
				}
				this.currentexport.set(fileid,item);
			};
			this.filedb.getChunks(fileid,updateexport,(e) => console.log(`failed to get chunks from file id ${fileid}`));
		};
		this.filedb.getFile(fileid,onsuccess,(e) => console.log(`failed to get file ${fileid}`));
	}
}
