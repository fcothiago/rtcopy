const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

//Setting Routes
const folderRoutes = require('./routes/folderRoutes');
app.use('/',folderRoutes);

//Set up static folder (for CSS & JS)
const path = require("path");
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
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
