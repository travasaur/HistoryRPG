import Phaser from 'phaser';

/**
 * Loads every asset listed in assets/manifest.json and shows a simple loading bar.
 * Game code then refers to assets by their key (e.g. "player"), never by file path.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const manifest = this.cache.json.get('manifest');

    for (const sheet of manifest.spritesheets ?? []) {
      this.load.spritesheet(sheet.key, sheet.url, {
        frameWidth: sheet.frameWidth,
        frameHeight: sheet.frameHeight,
      });
    }
    for (const image of manifest.images ?? []) this.load.image(image.key, image.url);
    for (const tileset of manifest.tilesets ?? []) this.load.image(tileset.key, tileset.url);
    for (const map of manifest.maps ?? []) this.load.tilemapTiledJSON(map.key, map.url);

    this.drawLoadingBar();
    this.load.on('loaderror', (file) => console.error(`Could not load asset "${file.key}" from ${file.url}`));
  }

  create() {
    this.scene.start('Title');
  }

  drawLoadingBar() {
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2 - 80, height / 2, 0, 6, 0xf0e6d2).setOrigin(0, 0.5);
    this.add.rectangle(width / 2, height / 2, 164, 10).setStrokeStyle(1, 0xf0e6d2);
    this.load.on('progress', (value) => (bar.width = 160 * value));
  }
}
