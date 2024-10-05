const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const socketHandler = require('./src/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173',
    },
});

socketHandler(io);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});