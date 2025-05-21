# rtcopy

rtcopy is a simple project that uses **WebRTC** and **WebSockets** to allow users to temporarily share files in a peer-to-peer (P2P) manner.

# How it works  
To create or access a virtual folder, go to a URL in the following format domain/folder/name/password or domain/folder/name, where **name** is the name of the virtual folder and **pass** is an optional password (if not provided, one will bee automatically generated).

After accessing the link, the user will enter a page where they can:

- Share local files
- Download files shared by other users connected to the same folder

No file is ever stored on a central server. Once the tab is closed, all access to your local files is revoked and the session ends automatically.

# Installation & Execution

**Requirements**: Node.js v22.14 or later.

1. Clone the repository:

```bash
git clone https://github.com/fcothiago/rtcopy.git
```
or with SSH.

```bash
git clone git@github.com:fcothiago/rtcopy.git
```   

2. Navigate to project directory and use npm to install all the dependencies.

```bash
cd rtcopy
npm install
``` 

3. Run the project

```bash
node src/index.js
```

By default, the project will run in localhost:7777.

# Configuration

Some parameters of the project can be configured using environment variables. The list below summarizes all available configuration options:

- **SERVER_PORT** : Configures the port that the server will listen on (default 7777)
- **SERVER_URL** : The address used to access the project (default: localhost). If you are hosting the project on a platform, you must change this parameter, since each open tab needs to initiate a new WebSocket connection.
- **CHUNK_SIZE_BYTES**: Number of bytes to be read per data chunk from a file.
- **CHUNK_COUNT**: Number of chunks to be requested from a user at a time.
