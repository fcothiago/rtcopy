class fileDatabase()
{
	constructor()
	{
		this.db = null;
		this.initDatabase();
	}

	initDatabase()
	{
		const request = indexeddb.open('storage',1);
		request.onupgradeneeded = (event) =>
		{
			this.db = event.target.result;
			const store = db.createObjectStore('files',{keyPath:'id'});
		};
		request.onsuccess = (event) =>
		{
			
		};
	}
}
