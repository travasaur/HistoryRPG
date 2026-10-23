import Phaser from 'phaser';

/**
 * First scene. Loads the asset manifest (the list of every image and map),
 * then hands off to PreloadScene, which loads everything on that list.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // The one file path the engine knows about. Every other path lives inside it.
    this.load.json('manifest', 'assets/manifest.json');
  }

  create() {
    this.scene.start('Preload');
  }
}
