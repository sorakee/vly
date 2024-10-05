import React, { useRef, useEffect, useState } from 'react';
import Phaser from 'phaser';
import GameScreen from './screens/GameScreen';
import { initAudio } from '../services/audio';
import './styles/Game.css'

const Game = () => {
    const gameRef = useRef(null);
    const [micPerm, setMicPerm] = useState(false);

    useEffect(() => {
        const checkMicPermission = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                setMicPerm(true);
            } catch (err) {
                console.error('Microphone permission denied:', err);
                setMicPerm(false);
            }
        };
    
        checkMicPermission();
    }, []);

    useEffect(() => {
        if (micPerm) {
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

            initAudio();

            return () => {
                if (gameRef.current) {
                    gameRef.current.destroy(true);
                }
            };
        }
    }, [micPerm]);

    if (!micPerm) {
        return (
            <div id='mic-perm'>
                <h2>MICROPHONE REQUIRED</h2>
                <p>Please grant microphone permission to play the game.</p>
                <button onClick={() => window.location.reload()}>RETRY</button>
            </div>
        );
    }

    return (
        <>
            <div id='game-container' />
        </>
    );
}

export default Game;