import Phaser from 'phaser';
import { loadContent, loadAllContent } from '../systems/ContentLoader.js';
import { Player } from '../systems/Player.js';
import { save } from '../systems/SaveSystem.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { LevelSelect } from '../ui/LevelSelect.js';
import { PauseMenu } from '../ui/PauseMenu.js';
import { h, uiRoot } from '../ui/dom.js';

const TALK_DISTANCE = 24; // how close (in pixels) Sivart must be to talk or use something
const HUB_MAP = 'archive'; // manifest key of the Archive hub map

/** Reads a custom property set on a Tiled object (e.g. "npc" or "dialogue"). */
function tiledProperty(object, name) {
  return object.properties?.find((p) => p.name === name)?.value;
}

/**
 * A walkable map loaded from Tiled: the Archive hub or a level.
 *
 * What the map needs (all set up in Tiled):
 *   - Tile layers (any names). Tiles with the property collides = true are solid.
 *   - An object layer named "Objects" containing:
 *       - a point named "player_start" where Sivart appears
 *       - NPC points with properties:  npc = the NPC's id (content/npcs/<id>.json)
 *                                      dialogue = conversation id (content/dialogue/<id>.json)
 *       - interactive things with:     sprite = manifest key of its picture
 *                                      action = what happens when used (see ACTIONS below)
 *                                      label = hint text, e.g. "Open the Living Record"
 *                                      dialogue = (optional) conversation to play first
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  init(data) {
    this.mapKey = data.mapKey ?? HUB_MAP;
    this.levelId = data.levelId ?? null; // null = the Archive hub
    this.ready = false; // becomes true once content has loaded
    this.busy = false; // true while a conversation is loading or showing
    this.menuOpen = false; // true while the pause menu or level select is open
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

    // ----- HTML UI: dialogue box, "press Space" hint, pause button -----
    this.dialogue = new DialogueBox(uiRoot());
    this.hint = h('div', { class: 'hint', hidden: true });
    this.pauseButton = h('button', {
      class: 'pause-button',
      'aria-label': 'Pause menu',
      onclick: () => this.openPauseMenu(),
    }, '☰');
    uiRoot().append(this.hint, this.pauseButton);

    // ----- Input -----
    this.talkKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on('pointerdown', (pointer) => this.handleTap(pointer));
    // Escape opens the pause menu. (A plain web listener, so menus can use Escape to close.)
    const onEscape = (event) => {
      if (event.key === 'Escape' && !this.menuOpen) this.openPauseMenu();
    };
    document.addEventListener('keydown', onEscape);

    this.events.once('shutdown', () => {
      document.removeEventListener('keydown', onEscape);
      this.dialogue.el.remove();
      this.hint.remove();
      this.pauseButton.remove();
    });

    // ----- NPCs and interactive objects (NPC data comes from content/npcs) -----
    this.npcs = this.physics.add.staticGroup();
    this.interactables = [];
    try {
      const npcObjects = objects.filter((o) => tiledProperty(o, 'npc'));
      const npcData = await loadAllContent(npcObjects.map((o) => `npcs/${tiledProperty(o, 'npc')}`));
      npcObjects.forEach((object, i) => this.addNpc(object, npcData[i]));
      objects.filter((o) => tiledProperty(o, 'action')).forEach((object) => this.addThing(object));
    } catch (error) {
      this.showProblem(error);
    }
    this.physics.add.collider(this.player.sprite, this.npcs);

    this.ready = true;
    if (this.levelId) this.enterLevel();
  }

  /** An NPC: solid, and talks when you press Space next to them. */
  addNpc(object, data) {
    const npc = this.npcs.create(object.x, object.y, data.sprite, 0);
    npc.setDepth(npc.y);
    npc.setData({
      label: `Talk to ${data.name}`,
      dialogue: tiledProperty(object, 'dialogue'),
      action: tiledProperty(object, 'action'),
    });
    // Same "feet only" collision box as the player.
    npc.body.setSize(npc.width - 6, npc.height / 2).setOffset(3, npc.height / 2);
    this.interactables.push(npc);
  }

  /** An interactive object, like the Living Record. Not solid (it sits on solid tiles). */
  addThing(object) {
    const thing = this.add.sprite(object.x, object.y, tiledProperty(object, 'sprite'), 0);
    thing.setDepth(thing.y);
    thing.setData({
      label: tiledProperty(object, 'label') ?? 'Use',
      dialogue: tiledProperty(object, 'dialogue'),
      action: tiledProperty(object, 'action'),
    });
    this.interactables.push(thing);
  }

  /** First time in a level: mark it started (autosaves) and play Mr. Senoj's briefing. */
  async enterLevel() {
    try {
      const level = await loadContent(`levels/${this.levelId}`);
      const firstVisit = !save.levelProgress(this.levelId)?.started;
      save.markLevelStarted(this.levelId);
      if (firstVisit && level.briefing) await this.playConversation(level.briefing);
    } catch (error) {
      this.showProblem(error);
    }
  }

  update() {
    if (!this.ready) return;
    this.player.update();

    const target = this.nearestInteractable();
    const canAct = !this.busy && !this.menuOpen && !this.dialogue.isOpen;
    this.hint.hidden = !(canAct && target);
    if (target) this.hint.textContent = `Space or tap: ${target.getData('label')}`;

    if (Phaser.Input.Keyboard.JustDown(this.talkKey) && !this.menuOpen) {
      if (this.dialogue.isOpen) this.dialogue.advance();
      else this.interact(target);
    }
  }

  /** A tap or click on the game: advance dialogue, or use the thing that was tapped. */
  handleTap(pointer) {
    if (!this.ready || this.menuOpen) return;
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }
    const near = this.nearestInteractable();
    if (near?.getBounds().contains(pointer.worldX, pointer.worldY)) this.interact(near);
  }

  /** The closest NPC or object within reach, or undefined if nothing is close. */
  nearestInteractable() {
    const { x, y } = this.player.sprite;
    let best;
    let bestDistance = TALK_DISTANCE;
    for (const thing of this.interactables) {
      const distance = Phaser.Math.Distance.Between(x, y, thing.x, thing.y);
      if (distance <= bestDistance) {
        best = thing;
        bestDistance = distance;
      }
    }
    return best;
  }

  /** Talk to an NPC or use an object: play its dialogue (if any), then run its action (if any). */
  async interact(target) {
    if (!target || this.busy || this.menuOpen) return;
    const dialogueId = target.getData('dialogue');
    const action = target.getData('action');
    if (dialogueId) await this.playConversation(dialogueId);
    if (action) await this.runAction(action);
  }

  /** Things an object can do, by the name used in its Tiled "action" property. */
  async runAction(action) {
    const ACTIONS = {
      level_select: () => this.openLevelSelect(),
    };
    if (ACTIONS[action]) return ACTIONS[action]();
    return this.showProblem(new Error(`The map uses an action called "${action}", but the game doesn't know it yet.`));
  }

  async playConversation(dialogueId) {
    if (this.busy) return;
    this.busy = true;
    this.player.freeze();
    try {
      const conversation = await loadContent(`dialogue/${dialogueId}`);
      // Look up display names for everyone who speaks in this conversation.
      const speakerIds = [...new Set(conversation.lines.map((line) => line.speaker))];
      const speakerData = await Promise.all(
        speakerIds.map((id) => loadContent(`npcs/${id}`).catch(() => ({ name: id })))
      );
      const speakers = Object.fromEntries(speakerIds.map((id, i) => [id, speakerData[i]]));
      await this.dialogue.play(conversation.lines, speakers);
    } catch (error) {
      await this.dialogue.play([{ speaker: 'Problem loading content', text: error.message }]);
      console.error(error);
    }
    this.player.unfreeze();
    this.busy = false;
  }

  // ----- Menus -----

  /** Runs a menu while the world is paused. */
  async withMenu(openMenu) {
    if (this.menuOpen || this.busy || this.dialogue.isOpen) return null;
    this.menuOpen = true;
    this.player.freeze();
    try {
      return await openMenu();
    } finally {
      this.menuOpen = false;
      this.player.unfreeze();
    }
  }

  async openLevelSelect() {
    let levelId = null;
    try {
      levelId = await this.withMenu(() => LevelSelect.open());
    } catch (error) {
      return this.showProblem(error);
    }
    if (!levelId) return;
    const level = await loadContent(`levels/${levelId}`);
    this.scene.start('World', { mapKey: level.startMap, levelId });
  }

  async openPauseMenu() {
    const choice = await this.withMenu(() => PauseMenu.open({ inLevel: Boolean(this.levelId) }));
    if (choice === 'archive') this.scene.start('World', { mapKey: HUB_MAP, levelId: null });
    if (choice === 'title') this.scene.start('Title');
  }

  /** Shows a content error in the dialogue box instead of silently breaking. */
  showProblem(error) {
    console.error(error);
    return this.dialogue.play([{ speaker: 'Problem loading content', text: error.message }]);
  }
}
