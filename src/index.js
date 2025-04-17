const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require("path");
const socketIo = require('socket.io');

const CORS_Config =
{ 
	origin: '*',
	methods: ['GET', 'POST']
}
const app = express();
app.use(cors(CORS_Config));

//Creating server and Websockets
const server = http.createServer(app);
const io = socketIo(server,{
	cors:CORS_Config
});

//Setting Routes
const folderRoutes = require('./routes/folderRoutes');
app.use('/',folderRoutes);

//Set up static folder (for CSS & JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

//Set render engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, ".." , "views")); // Set views folder

//Config WSServer
const wsserver = require('./websocket/wsserver');
io.on("connection", (socket) =>{
	console.log(`New socket connection from socket id ${socket.id}`);
	wsserver.handle_socket_connection(socket);
})

//Starting Server
const PORT = process.env.PORT || 7777;
server.listen(PORT,'0.0.0.0',() => {
	console.log(`Server running on http://localhost:${PORT}`);
});
