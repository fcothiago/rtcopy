class fileDatabase
{
	constructor()
	{
		this.db = null;
		this.dbver = 1;
		this.initDatabase();
	}

	checkDB()
	{
		if(!this.db)
			throw 'database was not properly initialized';
	}

	initDatabase()
	{
		const request = indexedDB.open('storage',this.dbver);
		request.onupgradeneeded = (e) =>
		{
			this.db = e.target.result;
			if (this.db.objectStoreNames.contains('files'))
				return;
			//TODO:Ensure that all chunks will be stored in order
			const storeitem = this.db.createObjectStore('files',{keyPath:'id',autoIncrement:true});
			const storechunks = this.db.createObjectStore('chunks',{keyPath:'id',autoIncrement:true});
			storechunks.createIndex("fileid","fileid",{unique:false});
			storechunks.createIndex("index","index",{unique:false});
		};
		request.onsuccess = (e) => { this.db = e.target.result; };
		request.onerror = (e) => {console.log(`initDatabase error ${e.target.error}`);};
	}

	addFile(fileinfos,onsuccess,onerror)
	{
		this.checkDB();
		const transaction = this.db.transaction('files','readwrite');
		const store = transaction.objectStore('files'); 
		const item = { 
			name : fileinfos.name,
			size : fileinfos.size,
			type : fileinfos.type,
			finished: false
		};
		const addrequest = store.add(item);
		addrequest.onsuccess = (e) => onsuccess(e.target.result);
		addrequest.onerror = onerror; 
	}

	removeFile(fileid,onsuccess,onfail)
	{
		this.checkDB();
		const transaction = this.db.transaction('files','readwrite');
		const store = transaction.objectStore('files'); 
		const request = store.delete(fileid);
		request.onsuccess = () => {
			onsuccess(fileid);
			this.removeChunks(fileid,() => {},(fileid) => console.log(`failed to remove chunks from file ${fileid}`))
		};
		request.onfail = onfail;
	}

	removeChunks(fileid,onsuccess,onfail)
	{
		const transaction = this.db.transaction('chunks','readwrite');
		const store = transaction.objectStore('chunks');
		const index = store.index('fileid');
		const range = IDBKeyRange.only(fileid);
		const cursorrequest = index.openCursor(range);
		cursorrequest.onsuccess = (e) => {
			const cursor = e.target.result;
			cursor ? cursor.delete() : onfail(fileid);
		};
	}

	addChunk(fileid,chunk,index,onsuccess,onerror)
	{
		this.checkDB();
		const transaction = this.db.transaction('chunks','readwrite');
		const store = transaction.objectStore('chunks'); 
		const item = {
			fileid:fileid,
			chunk:chunk,
			index:index
		};
		const addrequest = store.add(item);
		addrequest.onsuccess = onsuccess;
		addrequest.onerror = onerror; 
	}

	getFile(fileid,onsuccess,onerror)
	{
		this.checkDB();
		const transaction = this.db.transaction('files','readwrite');
		const store = transaction.objectStore('files');
		const getrequest = store.get(fileid);
		getrequest.onsuccess = () => onsuccess(getrequest.result);
		getrequest.onerror = (e) => onerror(e);
	}

	getAllFiles(onfilerecived,onfail)
	{
		this.checkDB();
		const transaction = this.db.transaction("files","readonly");
		const store = transaction.objectStore("files");
		const cursorRequest = store.openCursor();
		cursorRequest.onsuccess = (e) => {
			const cursor = e.target.result;
			if(!cursor)
				return;
			onfilerecived(cursor.value);
			cursor.continue();
		};
		cursorRequest.onerror = onfail;
	}

	getChunks(fileid,onchunkrecived,onerror)
	{
		this.checkDB();
		const transaction = this.db.transaction('chunks','readwrite');
		const store = transaction.objectStore('chunks');
		const index = store.index('fileid');
		const getrequest = index.openCursor(fileid);
		getrequest.onsuccess = (e) => {
			const cursor = e.target.result;
			if(!cursor)
				return;
			onchunkrecived(cursor.value);
			cursor.continue();
		}
		getrequest.onerror = (e) => onerror(e);
	}

	updateFinishedStatus(fileid,finished,onsuccess,onerror)
	{
		this.checkDB();
		getsuccess = (file) => 
		{
			if(!file)
				return;
			const transaction = this.db.transaction('files','readwrite');
			const store = transaction.objectStore('files');	
			const getrequest = store.get(fileid);
			file.finished = finished;
			updaterequest = store.put(file);
			updaterequest.onsuccess = onsuccess;
			updaterequest.onerror = onerror;
		}
		this.getFile(fileid,onsuccess,onerror);
	}
}
