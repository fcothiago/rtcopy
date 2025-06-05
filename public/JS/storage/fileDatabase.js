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
		request.onupgradeneeded = (event) =>
		{
			this.db = event.target.result;
			if (this.db.objectStoreNames.contains('files'))
				return;
			const storeitem = this.db.createObjectStore('files',{keyPath:'id',autoIncrement:true});
			const storechunks = this.db.createObjectStore('chunks',{keyPath:'index'});
			storechunks.createIndex("fileid","fileid",{unique:false});
		};
		request.onsuccess = (event) => { this.db = event.target.result; };
		request.onerror = (event) => {console.log(`initDatabase error ${event.target.error}`);};
	}

	addFile(fileinfos,onsuccess,onerror)
	{
		this.checkDB();
		const transaction = this.db.transaction('files','readwrite');
		const store = transaction.objectStore('files'); 
		const item = { 
			name : fileinfos.name,
			size : fileinfos.size,
			finished: false
		};
		const addrequest = store.add(item);
		addrequest.onsuccess = (event) = onsuccess(event.target.result);
		addrequest.onerror = onerror; 
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
		getRequest.onsuccess = () => onsuccess(getrequest.result);
		getRequest.onerror = (e) => onerror(e);
	}

	getChunks(fileid,onchunkrecived,onerror)
	{
		this.checkDB();
		const transaction = this.db.transaction('chunk','readwrite');
		const store = transaction.objectStore('chunk');
		const index = store.index('fileid');
		const getrequest = index.openCursor(fileid);
		getRequest.onsuccess = () => {
			const cursor = event.target.result;
			if(!cursor)
				return;
			onchunkrecived(cursor.value);
			cursor.continue();
		}
		getRequest.onerror = (e) => onerror(e);
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
