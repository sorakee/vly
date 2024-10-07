import Phaser from 'phaser';
import { getVolumeLevel } from '../services/audio';

const BOUNCE_X = 0.5;
const BOUNCE_Y = 0;
const GRAVITY_Y = 2000;
const STARTPOS_X = 180;
const STARTPOX_Y = 480;
const COLLSIZE_X = 20;
const COLLSIZE_Y = 30;
const MAX_VELOCITY_Y = -1100;

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
        this.playerSpeed = 200;
        this.scrollSpeed = 0.2;
        this.soundFX = new Map();
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
        this.load.audio('jumpSFX', 'src/assets/jumpSFX.mp3');
        this.load.audio('stepSFX', 'src/assets/stepSFX.mp3');
    }

    create() {
        let { width: gameWidth, height: gameHeight } = this.sys.game.canvas;

        this.soundFX.set('jumpSFX', this.sound.add('jumpSFX'));
        this.soundFX.set('stepSFX', this.sound.add('stepSFX', { loop: true, volume: 0.8 }))

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(gameWidth * 0.5, gameHeight * 0.9, 'ground');

        this.player = this.createCharacter(this, 'player');
        this.opponent = this.createCharacter(this, 'opponent', 0.5);

        this.player.body.world.on('worldbounds', () => {
            if (this.player.body.blocked.left || this.player.body.blocked.right) {
                this.player.flipX = !this.player.flipX;
                this.playerSpeed = this.playerSpeed * -1;
            }
            if (this.player.body.blocked.down) {
                console.log("BOTTOM BOUNDARY TOUCHED. GAME OVER NOOB")
                this.playerSpeed = 0;
                this.player.setVelocity(0);
                this.player.anims.stop();
                this.soundFX.get('stepSFX').stop();
                this.gameOver = true;
            }
        });
        this.anims.create({
            key: 'player-run',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'player-jump',
            frames: this.anims.generateFrameNumbers('player', { start: 9, end: 12 }),
            frameRate: 8,
            repeat: 0
        });

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.opponent, this.platforms);
        this.opponent.body.onWorldBounds = false;

        // Placeholder jump button
        // TODO: Replace with mic input instead
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.gameOver) return;

        this.playerMovement();   
        this.scrollMap();
    }

    /** 
    * @param {Phaser.Scene} scene
    * @param {string} spriteKey
    * @param {number} alpha
    * @returns {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody} 
    */
    createCharacter(scene, spriteKey, alpha = 1) {
        const character = scene.physics.add.sprite(STARTPOS_X, STARTPOX_Y, spriteKey);
        character.setBounceY(BOUNCE_Y);
        character.setBounceX(BOUNCE_X);
        character.setCollideWorldBounds(true);
        character.body.onWorldBounds = true;
        character.body.setGravityY(GRAVITY_Y);
        character.body.setSize(COLLSIZE_X, COLLSIZE_Y);
        character.alpha = alpha;
        return character;
    }

    playerMovement() {
        // Get audio source (e.g. mic) vol. level
        const srcVol = getVolumeLevel();
        // console.log(srcVol);
        const deltaY = this.player.body.position.y - this.player.body.prev.y;

        // Automatic horizontal player movement
        this.player.setVelocityX(this.playerSpeed);
        // Jump and Landing
        // if (srcVol !== 0 && this.player.body.touching.down)
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.soundFX.get('jumpSFX').play();
            this.player.anims.play('player-jump');
            this.player.setVelocityY(MAX_VELOCITY_Y);
            if (this.soundFX.get('stepSFX').isPlaying) {
                this.soundFX.get('stepSFX').stop();
            }
        } else if (deltaY > -0.1 && this.player.body.onFloor() && this.player.anims.currentAnim?.key !== 'player-run') {
            this.player.anims.play('player-run').on;
            if (!this.soundFX.get('stepSFX').isPlaying) {
                this.soundFX.get('stepSFX').play();
            }
        }
    }

    scrollMap() {
        this.platforms.children.iterate((platform) => {
            platform.y += this.scrollSpeed;
            platform.body.updateFromGameObject();
        });
    }

    createPlatform () {
        // TODO: Create a platform as game scrolls down
    }
}

export default GameScreen;