import Phaser from "phaser";

class GameScreen extends Phaser.Scene {
    constructor() {
        super('GameScreen');
        this.socket = null;
    }

    init(data) {
        this.socket = data.socket;
        console.log(this.socket);
    }

    preload() {
        // TODO: Load assets
    }

    create() {
        // TODO: Setup game objects on the scene
    }

    update() {
        // TODO: Game loop
    }
}

export default GameScreen;