class GameState {
    constructor() {
        this.players = new Map();
        this.scrollSpeed = 1;
    }

    addPlayer(id) {
        this.players.set(id, {
            x: 0,
            y: 0,
            direction: 1,
        });
    }

    removePlayer(id) {
        this.players.delete(id);
    }

    updatePlayer(id, data) {
        const player = this.players.get(id);
        if (player) {
            Object.assign(player, data);
        }
    }

    increaseScrollSpeed() {
        this.scrollSpeed *= 1.05;
    }

    getState() {
        return {
            players: Array.from(this.players.entries()),
            scrollSpeed: this.scrollSpeed
        };
    }
}

module.exports = GameState;