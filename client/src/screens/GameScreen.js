import Phaser from 'phaser';

const BOUNCE = 0.3;
const GRAVITY_Y = 2000;
const STARTPOS_X = 180;
const STARTPOX_Y = 546;
const COLLSIZE_X = 20;
const COLLSIZE_Y = 30;
const MAX_VELOCITY_Y = -1200;

class GameScreen extends Phaser.Scene {
    constructor() {
        super('GameScreen');
        this.socket = null;
        this.player = null;
        this.opponent = null;
        this.platforms = null;
        this.cursors = null;
        this.gameOver = false;
        this.voiceMeter = null;
        this.playerSpeed = 180;
        this.scrollSpeed = 1;
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

        this.player = this.createCharacter(this, 'player');
        this.opponent = this.createCharacter(this, 'opponent', 0.5);

        this.player.body.world.on('worldbounds', () => {
            if (this.player.body.blocked.left || this.player.body.blocked.right) {
                this.player.flipX = !this.player.flipX;
                this.playerSpeed *= -1;
            }
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

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.opponent, this.platforms);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Automatic horizontal player movement
        this.player.setVelocityX(this.playerSpeed);
        const deltaY = this.player.body.position.y - this.player.body.prev.y;
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.anims.play('jump');
            this.player.setVelocityY(MAX_VELOCITY_Y);
        } else if (deltaY > -0.1 && this.player.body.onFloor() && this.player.anims.currentAnim?.key !== 'run') {
            this.player.anims.play('run');
        }
    }

    initCharacters() {
        

        

        
    }

    /** @returns {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody} */
    createCharacter(scene, spriteKey, alpha = 1) {
        const character = scene.physics.add.sprite(STARTPOS_X, STARTPOX_Y, spriteKey);
        character.setBounce(0.3);
        character.setCollideWorldBounds(true);
        character.body.onWorldBounds = true;
        character.body.setGravityY(GRAVITY_Y);
        character.body.setSize(COLLSIZE_X, COLLSIZE_Y);
        character.alpha = alpha;
        return character;
    }
}

export default GameScreen;