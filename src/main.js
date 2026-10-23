// Entry point: sets up Phaser and lists the game's scenes.
import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { WorldScene } from './scenes/WorldScene.js';

// Add ?debug to the address (e.g. http://localhost:5173/?debug) to see collision boxes.
const showDebug = new URLSearchParams(window.location.search).has('debug');

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  // Fixed internal resolution: 320 x 180 pixels = 20 x 11 tiles of 16 px.
  // Phaser scales this up to fit the window (about 4x on a 1280 x 720 screen).
  width: 320,
  height: 180,
  pixelArt: true, // keep pixels crisp instead of blurry when scaled up
  roundPixels: true,
  backgroundColor: '#1b1b24',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade', // simple, fast box collisions: good for Chromebooks
    arcade: { debug: showDebug },
  },
  scene: [BootScene, PreloadScene, WorldScene],
};

const game = new Phaser.Game(config);

// In debug mode, make the game reachable from the browser console for troubleshooting.
if (showDebug) window.game = game;
