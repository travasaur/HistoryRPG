import Phaser from 'phaser';

const SPEED = 80; // pixels per second (5 tiles per second)

// Which frame of the player sprite sheet faces which way.
const FACING_FRAMES = { down: 0, left: 1, right: 2, up: 3 };

/**
 * Sivart: moves in 4 directions with the arrow keys or WASD and bumps into walls.
 */
export class Player {
  constructor(scene, x, y) {
    this.sprite = scene.physics.add.sprite(x, y, 'player', FACING_FRAMES.down);
    this.sprite.setCollideWorldBounds(true);

    // The collision box covers only the feet (bottom half of the sprite), so Sivart's
    // head can overlap a wall above him, which looks natural in a top-down game.
    const { width, height } = this.sprite;
    this.sprite.body.setSize(width - 6, height / 2, false).setOffset(3, height / 2);

    const keyboard = scene.input.keyboard;
    this.keys = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.facing = 'down';
    this.frozen = false; // true while talking, so Sivart can't walk away mid-conversation
  }

  /** Called every frame by the scene. */
  update() {
    const body = this.sprite.body;
    body.setVelocity(0);
    // Keep characters lower on screen drawn in front of ones higher up.
    this.sprite.setDepth(this.sprite.y);
    if (this.frozen) return;

    const k = this.keys;
    // Only one direction at a time (no diagonals). Left/right wins if both are held.
    if (k.left.isDown || k.a.isDown) this.move(-SPEED, 0, 'left');
    else if (k.right.isDown || k.d.isDown) this.move(SPEED, 0, 'right');
    else if (k.up.isDown || k.w.isDown) this.move(0, -SPEED, 'up');
    else if (k.down.isDown || k.s.isDown) this.move(0, SPEED, 'down');
  }

  move(vx, vy, facing) {
    this.sprite.body.setVelocity(vx, vy);
    this.facing = facing;
    this.sprite.setFrame(FACING_FRAMES[facing]);
  }

  freeze() {
    this.frozen = true;
    this.sprite.body.setVelocity(0);
  }

  unfreeze() {
    this.frozen = false;
  }
}
