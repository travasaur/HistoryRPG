import Phaser from 'phaser';
import { loadContent, loadAllContent } from '../systems/ContentLoader.js';
import { Player } from '../systems/Player.js';
import { DialogueBox } from '../ui/DialogueBox.js';

const TALK_DISTANCE = 24; // how close (in pixels) Sivart must be to talk to someone

/** Reads a custom property set on a Tiled object (e.g. "npc" or "dialogue"). */
function tiledProperty(object, name) {
  return object.properties?.find((p) => p.name === name)?.value;
}

/**
 * A walkable map loaded from Tiled.
 *
 * What the map needs (all set up in Tiled):
 *   - Tile layers (any names). Tiles with the property collides = true are solid.
 *   - An object layer named "Objects" containing:
 *       - a point named "player_start" where Sivart appears
 *       - NPC points with properties: npc = the NPC's id (content/npcs/<id>.json)
 *                                     dialogue = conversation id (content/dialogue/<id>.json)
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  init(data) {
    this.mapKey = data.mapKey;
    this.ready = false; // becomes true once content has loaded
    this.busy = false; // true while a conversation is loading or showing
  }

  async create() {
    // ----- Map and collisions -----
    const map = this.make.tilemap({ key: this.mapKey });
    // Each tileset's name in Tiled matches its key in assets/manifest.json.
    const tilesets = map.tilesets.map((tileset) => map.addTilesetImage(tileset.name, tileset.name));
    const layers = map.layers.map((layerData) => {
      const layer = map.createLayer(layerData.name, tilesets);
      layer.setCollisionByProperty({ collides: true });
      return layer;
    });

    const objects = map.getObjectLayer('Objects')?.objects ?? [];
    const start = objects.find((o) => o.name === 'player_start') ?? { x: 32, y: 32 };

    // ----- Player and camera -----
    this.player = new Player(this, start.x, start.y);
    for (const layer of layers) this.physics.add.collider(this.player.sprite, layer);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player.sprite, true);

    // ----- Dialogue and input -----
    this.dialogue = new DialogueBox(document.getElementById('ui-root'));
    this.events.once('shutdown', () => this.dialogue.el.remove());
    this.talkKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on('pointerdown', (pointer) => this.handleTap(pointer));

    // ----- NPCs (data comes from content/npcs) -----
    this.npcs = this.physics.add.staticGroup();
    const npcObjects = objects.filter((o) => tiledProperty(o, 'npc'));
    try {
      const npcData = await loadAllContent(npcObjects.map((o) => `npcs/${tiledProperty(o, 'npc')}`));
      npcObjects.forEach((object, i) => this.addNpc(object, npcData[i]));
    } catch (error) {
      this.showProblem(error);
    }
    this.physics.add.collider(this.player.sprite, this.npcs);

    this.ready = true;
  }

  addNpc(object, data) {
    const npc = this.npcs.create(object.x, object.y, data.sprite, 0);
    npc.setDepth(npc.y);
    npc.setData({ id: data.id, info: data, dialogue: tiledProperty(object, 'dialogue') });
    // Same "feet only" collision box as the player.
    npc.body.setSize(npc.width - 6, npc.height / 2).setOffset(3, npc.height / 2);
  }

  update() {
    if (!this.ready) return;
    this.player.update();

    if (Phaser.Input.Keyboard.JustDown(this.talkKey)) {
      if (this.dialogue.isOpen) this.dialogue.advance();
      else this.tryTalk(this.nearestNpc());
    }
  }

  /** A tap or click on the game: advance dialogue, or talk to the NPC that was tapped. */
  handleTap(pointer) {
    if (!this.ready) return;
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }
    const near = this.nearestNpc();
    if (near?.getBounds().contains(pointer.worldX, pointer.worldY)) this.tryTalk(near);
  }

  /** The closest NPC within talking distance, or undefined if nobody is close. */
  nearestNpc() {
    const { x, y } = this.player.sprite;
    let best;
    let bestDistance = TALK_DISTANCE;
    for (const npc of this.npcs.getChildren()) {
      const distance = Phaser.Math.Distance.Between(x, y, npc.x, npc.y);
      if (distance <= bestDistance) {
        best = npc;
        bestDistance = distance;
      }
    }
    return best;
  }

  async tryTalk(npc) {
    if (!npc || this.busy || !npc.getData('dialogue')) return;
    this.busy = true;
    this.player.freeze();
    try {
      const conversation = await loadContent(`dialogue/${npc.getData('dialogue')}`);
      // Look up display names for everyone who speaks in this conversation.
      const speakerIds = [...new Set(conversation.lines.map((line) => line.speaker))];
      const speakerData = await Promise.all(
        speakerIds.map((id) => loadContent(`npcs/${id}`).catch(() => ({ name: id })))
      );
      const speakers = Object.fromEntries(speakerIds.map((id, i) => [id, speakerData[i]]));
      await this.dialogue.play(conversation.lines, speakers);
    } catch (error) {
      await this.showProblem(error);
    }
    this.player.unfreeze();
    this.busy = false;
  }

  /** Shows a content error in the dialogue box instead of silently breaking. */
  showProblem(error) {
    console.error(error);
    return this.dialogue.play([{ speaker: 'Problem loading content', text: error.message }]);
  }
}
