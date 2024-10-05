import React, { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import GameScreen from './screens/GameScreen';

const Game = () => {
    const gameRef = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: 720,
            height: 1280,
            scale: {
                mode: Phaser.Scale.FIT
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 },
                    debug: true
                }
            },
            scene: [GameScreen]
        };

        const game = new Phaser.Game({ ...config, parent: 'game-container' });
        gameRef.current = game;

        return () => {
            game.destroy(true);
            gameRef.current = null;
        };
    }, [])

    return (
        <>
            <div id='game-container' />
        </>
    );
}

export default Game;