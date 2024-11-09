import Phaser from 'phaser';
import { getVolumeLevel } from '../services/audio';

const BOUNCE_X = 0.5;
const BOUNCE_Y = 0;
const GRAVITY_Y = 2000;
const STARTPOS_X = 180;
const STARTPOX_Y = 480;
const COLLSIZE_X = 20;
const COLLSIZE_Y = 30;
const MAX_VELOCITY_Y = -600;
const PLATFORM_YSPACING = 150;

class GameScreen extends Phaser.Scene {
    constructor() {
        super('GameScreen');
        this.socket = null;
        this.player = null;
        this.opponent = null;
        this.ground = null;
        this.cursors = null;
        this.gameOver = false;
        this.voiceMeter = null;
        this.playerSpeed = 200;
        this.scrollSpeed = 0.2;
        this.soundFX = new Map();
        this.platformPool = null;
        this.platforms = null;
        this.lastPlatformY = null;
    }

    init(data) {
        this.socket = data.socket;
        console.log(this.socket);
    }

    preload() {
        this.load.image('ground', 'src/assets/ground.png');
        this.load.image('platform-left', 'src/assets/left-platform.png');
        this.load.image('platform-middle', 'src/assets/middle-platform.png');
        this.load.image('platform-right', 'src/assets/right-platform.png');
        this.load.spritesheet(
            'player', 'src/assets/player-spritesheet.png',
            { frameWidth: 32, frameHeight: 32 }
        );
        this.load.spritesheet(
            'opponent', 'src/assets/opponent-spritesheet.png',
            { frameWidth: 32, frameHeight: 32 }
        );
        this.load.audio('stepSFX', 'src/assets/stepSFX.mp3');
    }

    create() {
        let { width: gameWidth, height: gameHeight } = this.sys.game.canvas;

        this.soundFX.set('stepSFX', this.sound.add('stepSFX', { loop: true, volume: 0.8 }))

        this.platformPool = this.add.group({
            removeCallback: function (platform) {
                this.platforms.add(platform);
            }
        })
        this.platforms = this.add.group({
            removeCallback: function (platform) {
                this.platformPool.add(platform);
            }
        });

        this.ground = this.physics.add.staticGroup();
        this.ground.create(gameWidth * 0.5, gameHeight * 0.9, 'ground');

        this.player = this.createCharacter(this, 'player');
        this.opponent = this.createCharacter(this, 'opponent', 0.5);

        this.player.body.world.on('worldbounds', () => {
            if (this.player.body.blocked.left || this.player.body.blocked.right) {
                this.player.flipX = !this.player.flipX;
                this.playerSpeed = this.playerSpeed * -1;
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

        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.opponent, this.ground);
        this.opponent.body.onWorldBounds = false;

        // Initial platform generation (client-side)
        // TODO: move this implementation to the server
        for (let i = 0; i < 5; i++) {
            const yOffset = 240;
            this.createPlatformAtPosY((this.sys.game.canvas.height - yOffset) - i * PLATFORM_YSPACING);
        }
    }

    update() {
        if (this.gameOver) return;

        this.playerMovement();
        this.scrollMap();
        this.checkForGameOver();
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
        let srcVol = getVolumeLevel();
        // Convert range from 0.6 - 1.0 to 0 - 1
        srcVol = (srcVol - 0.6) / 0.4;

        // console.log(srcVol);
        const deltaY = this.player.body.position.y - this.player.body.prev.y;

        // Automatic horizontal player movement
        this.player.setVelocityX(this.playerSpeed);

        // Fly and Landing
        if (srcVol > 0.2) {
            this.player.setVelocityY(Phaser.Math.Linear(0, MAX_VELOCITY_Y, srcVol));
            if (this.player.body.blocked.down) {
                this.player.anims.play('player-jump');

                if (this.soundFX.get('stepSFX').isPlaying) {
                    this.soundFX.get('stepSFX').stop();
                }
            }
        } else if (deltaY > -0.1 && this.player.body.onFloor() && this.player.anims.currentAnim?.key !== 'player-run') {
            this.player.anims.play('player-run');
            if (!this.soundFX.get('stepSFX').isPlaying) {
                //this.soundFX.get('stepSFX').play();
            }
        }
    }

    scrollMap() {
        this.platforms.children.iterate((platform) => {
            platform.y += this.scrollSpeed;
            platform.body.updateFromGameObject();
        });
        this.ground.children.iterate((ground) => {
            ground.y += this.scrollSpeed;
            ground.body.updateFromGameObject();
        });
    }

    checkForGameOver() {
        // If player flies too high or fall, then game over.
        if (this.player.y + 16 > this.sys.game.canvas.height || this.player.y - 16 < 0) {
            console.log('Game Over: Player fell into the void!');
            this.playerSpeed = 0;
            this.player.setVelocity(0);
            this.player.anims.stop();
            this.soundFX.get('stepSFX').stop();
            this.gameOver = true;
        }
    }

    createPlatformAtPosY(posY) {
        const minMiddleTiles = 1;
        const maxMiddleTiles = 10;

        const numMiddleTiles = Phaser.Math.Between(minMiddleTiles, maxMiddleTiles);
        const platformWidth = (numMiddleTiles + 2) * 32;

        let posX = Phaser.Math.Between(0, 360 - platformWidth);

        let platformGroup = this.physics.add.staticGroup();
        const leftEdge = this.getPooledPlatform(posX, posY, 'platform-left');
        platformGroup.add(leftEdge);

        const rightEdge = this.getPooledPlatform(posX + 32 * (numMiddleTiles + 1), posY, 'platform-right');
        platformGroup.add(rightEdge);

        for (let i = 0; i < numMiddleTiles; i++) {
            const middle = this.getPooledPlatform(posX + 32 * (i + 1), posY, 'platform-middle');
            platformGroup.add(middle);
        }

        this.platforms.addMultiple(platformGroup.getChildren());
        this.physics.add.collider(this.player, platformGroup);

        this.lastPlatformY = posY;
    }

    getPooledPlatform(posX, posY, key) {
        let platform = this.platformPool.getFirstDead();

        if (!platform) {
            platform = this.physics.add.staticSprite(posX, posY, key).setOrigin(0, 0);
            platform.body.checkCollision.down = false;
            platform.body.checkCollision.left = false;
            platform.body.checkCollision.right = false;
        } else {
            platform.reset(posX, posY);
            platform.active = true;
            platform.visible = true;
            this.physics.world.enable(platform);
        }

        return platform;
    }
}

export default GameScreen;