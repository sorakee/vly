import React, { useRef, useEffect, useState } from 'react';
import Phaser from 'phaser';
import GameScreen from './screens/GameScreen';
import { initAudio } from '../services/audio';
import { socket } from '../services/socket';
import './styles/Game.css'


const Game = () => {
    const gameRef = useRef(null);
    const [micPerm, setMicPerm] = useState(null);

    useEffect(() => {
        const checkMicPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setMicPerm(true);
                initAudio(stream);
            } catch (err) {
                console.error('Microphone permission denied:', err);
                setMicPerm(false);
            }
        };
    
        checkMicPermission();
    }, []);

    useEffect(() => {
        if (!micPerm || micPerm === null) return;

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
        game.scene.start('GameScreen', { socket });

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
            socket.disconnect();
        };
    }, [micPerm]);

    return (
        <>
            {micPerm ? (<div id='game-container' />) : (
                <div id='mic-perm'>
                    <h2>MICROPHONE REQUIRED</h2>
                    <p>Please grant microphone permission to play the game.</p>
                    <button onClick={() => window.location.reload()}>RETRY</button>
                </div>
            )}
        </>
    );
}

export default Game;