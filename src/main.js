// Entry point: sets up Phaser and lists the game's scenes.
import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import './systems/Settings.js'; // applies the saved text size

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
  scene: [BootScene, PreloadScene, TitleScene, WorldScene],
};

const game = new Phaser.Game(config);

// While a student is typing in a text box (like pasting a save code), turn off the game's
// keyboard so keys like W, A, S, D and Space type normally instead of moving Sivart.
const isTextBox = (el) => el?.matches?.('input, textarea');
document.addEventListener('focusin', (event) => {
  if (isTextBox(event.target)) game.input.keyboard.enabled = false;
});
document.addEventListener('focusout', (event) => {
  if (isTextBox(event.target)) game.input.keyboard.enabled = true;
});

// In debug mode, make the game reachable from the browser console for troubleshooting.
if (showDebug) window.game = game;
