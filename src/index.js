const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

//Setting Routes
const roomRoutes = require('./routes/roomRoutes');
app.use('/',roomRoutes);

//Set up static folder (for CSS & JS)
app.use(express.static(path.join(__dirname, 'public')));

//Starting Server
const PORT = process.env.PORT || 7777;
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
