import Phaser from 'phaser';

class GameScreen extends Phaser.Scene {
    constructor() {
        super('GameScreen');
        this.socket = null;
        this.player = null;
        this.opponent = null;
        this.platforms = null;
        this.cursors = null;
        this.scrollSpeed = 1;
        this.score = 0;
        this.gameOver = false;
        this.voiceMeter = null;
        this.playerSpeed = 180;
    }

    init(data) {
        this.socket = data.socket;
        console.log(this.socket);
    }

    preload() {
        this.load.image('ground', 'src/assets/ground.png');
        this.load.spritesheet(
            'player', 'src/assets/player-spritesheet.png', 
            { frameWidth: 32, frameHeight: 32 }
        );
        this.load.spritesheet(
            'opponent', 'src/assets/opponent-spritesheet.png', 
            { frameWidth: 32, frameHeight: 32 }
        );
    }

    create() {
        let { width: gameWidth, height: gameHeight } = this.sys.game.canvas;

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(gameWidth * 0.5, gameHeight, 'ground');

        this.player = this.physics.add.sprite(100, 450, 'player');
        this.player.setBounce(0.3);
        this.player.setCollideWorldBounds(true);
        this.player.body.onWorldBounds = true;
        this.player.body.setGravityY(800);
        this.player.body.setSize(20, 30);
        this.player.body.world.on('worldbounds', () => {
            this.player.flipX = !this.player.flipX;
            this.playerSpeed *= -1;
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 12 }),
            frameRate: 8,
            repeat: 0
        });
        this.player.anims.play('run');

        this.opponent = this.physics.add.sprite(200, 450, 'opponent');
        this.opponent.alpha = 0.5;
        this.opponent.setBounce(0.3);
        this.opponent.setCollideWorldBounds(true);
        this.opponent.body.onWorldBounds = true;
        this.opponent.body.setGravityY(400);
        this.opponent.body.setSize(20, 30);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.opponent, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Automatic horizontal player movement
        console.log(this.player.anims.currentAnim?.key)
        this.player.setVelocityX(this.playerSpeed);
        const deltaY = this.player.body.position.y - this.player.body.prev.y;
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.anims.play('jump');
            this.player.setVelocityY(-600);
        } else if (deltaY > -0.1 && this.player.body.onFloor() && this.player.anims.currentAnim?.key !== 'run') {
            this.player.anims.play('run');
        }
    }
}

export default GameScreen;