const GameState = require('./gameState');
const gameState = new GameState();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        gameState.addPlayer(socket.id);

        socket.on('playerMove', (data) => {
            gameState.updatePlayer(socket.id, data);
            // Send game state to the client
            io.emit('gameState', gameState.getState());
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            gameState.removePlayer(socket.id);
            io.emit('gameState', gameState.getState());
        });
    });
}