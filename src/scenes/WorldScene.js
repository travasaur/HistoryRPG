import Phaser from 'phaser';
import { loadContent, loadAllContent, loadDialogue } from '../systems/ContentLoader.js';
import { Player } from '../systems/Player.js';
import { QuestRunner } from '../systems/QuestRunner.js';
import { save } from '../systems/SaveSystem.js';
import { ChoiceBox } from '../ui/ChoiceBox.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { LevelSelect } from '../ui/LevelSelect.js';
import { PauseMenu } from '../ui/PauseMenu.js';
import { QuestHud } from '../ui/QuestHud.js';
import { StoryCard } from '../ui/StoryCard.js';
import { h, uiRoot } from '../ui/dom.js';

const TALK_DISTANCE = 24; // how close (in pixels) Sivart must be to talk or use something
const HUB_MAP = 'archive'; // manifest key of the Archive hub map
const DEBUG = new URLSearchParams(window.location.search).has('debug');

// Lighting a quest beat can ask for: a see-through color laid over the whole view.
const MOODS = {
  night: { color: 0x0a1030, alpha: 0.55 },
  gloom: { color: 0x1e1e24, alpha: 0.35 },
  dawn: { color: 0xff9966, alpha: 0.15 },
};

/** Reads a custom property set on a Tiled object (e.g. "npc" or "dialogue"). */
function tiledProperty(object, name) {
  return object.properties?.find((p) => p.name === name)?.value;
}

/**
 * A walkable map loaded from Tiled: the Archive hub or a level map.
 *
 * What the map can contain (all set up in Tiled; see tools/make-placeholders.mjs):
 *   - Tile layers (any names). Tiles with the property collides = true are solid.
 *   - An object layer named "Objects" with:
 *       player_start            default place Sivart appears
 *       spawn_<name>            other places Sivart can appear (quests use the <name>)
 *       spot_<name>             places a quest can stand an NPC
 *       rectangles with "area" and "label" properties: named places
 *       points with "npc" (+ "dialogue"): NPCs that are always there
 *       points with "sprite" + "action" + "label": things to use, like the Living Record
 *
 * In a level, the QuestRunner adds the beat's NPCs and runs the story.
 */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  init(data) {
    this.mapKey = data.mapKey ?? HUB_MAP;
    this.levelId = data.levelId ?? null; // null = the Archive hub, outside any level
    this.spawnName = data.spawn ?? null;
    this.ready = false; // becomes true once content has loaded
    this.busyCount = 0; // > 0 while a conversation, card, or question is showing
    this.menuOpen = false; // true while the pause menu or level select is open
    this.runner = null;
    this.npcInfo = {}; // npc id -> data from content/npcs
    this.markers = [];
    this.areaIds = [];
  }

  get busy() {
    return this.busyCount > 0;
  }

  async create() {
    this.cameras.main.fadeIn(250);

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
    this.spots = Object.fromEntries(
      objects.filter((o) => o.name.startsWith('spot_')).map((o) => [o.name.slice(5), o]));
    this.areas = objects
      .filter((o) => tiledProperty(o, 'area'))
      .map((o) => ({ id: tiledProperty(o, 'area'), label: tiledProperty(o, 'label') ?? o.name, rect: new Phaser.Geom.Rectangle(o.x, o.y, o.width, o.height) }));
    const start = objects.find((o) => o.name === `spawn_${this.spawnName}`)
      ?? objects.find((o) => o.name === 'player_start')
      ?? { x: 32, y: 32 };

    // ----- Player and camera -----
    this.player = new Player(this, start.x, start.y);
    for (const layer of layers) this.physics.add.collider(this.player.sprite, layer);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player.sprite, true);

    // ----- HTML UI -----
    const root = uiRoot();
    this.dialogue = new DialogueBox(root);
    this.card = new StoryCard(root);
    this.hud = new QuestHud(root);
    this.hint = h('div', { class: 'hint', hidden: true });
    this.pauseButton = h('button', {
      class: 'pause-button',
      'aria-label': 'Pause menu',
      onclick: () => this.openPauseMenu(),
    }, '☰');
    root.append(this.hint, this.pauseButton);

    // ----- Input -----
    this.talkKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on('pointerdown', (pointer) => this.handleTap(pointer));
    // Escape opens the pause menu. (A plain web listener, so menus can use Escape to close.)
    // In debug mode, ] skips the talk/go-to step the quest is waiting on.
    const onKey = (event) => {
      if (event.key === 'Escape' && !this.menuOpen) this.openPauseMenu();
      if (DEBUG && event.key === ']') this.runner?.debugSkip();
    };
    document.addEventListener('keydown', onKey);

    this.events.once('shutdown', () => {
      document.removeEventListener('keydown', onKey);
      this.runner?.stop();
      this.dialogue.el.remove();
      this.card.el.remove();
      this.hud.destroy();
      this.hint.remove();
      this.pauseButton.remove();
    });

    // ----- NPCs, things, and the quest -----
    this.npcs = this.physics.add.staticGroup();
    this.interactables = [];
    try {
      if (this.levelId) this.runner = await QuestRunner.create(this, this.levelId);

      // NPCs drawn into the map, plus the ones this quest beat stands at spots.
      const placements = objects
        .filter((o) => tiledProperty(o, 'npc'))
        .map((o) => ({ npc: tiledProperty(o, 'npc'), x: o.x, y: o.y, dialogue: tiledProperty(o, 'dialogue'), action: tiledProperty(o, 'action') }));
      for (const { npc, spot } of this.runner?.beatNpcs() ?? []) {
        const point = this.spots[spot];
        if (point) placements.push({ npc, x: point.x, y: point.y });
      }
      const ids = [...new Set(placements.map((p) => p.npc))];
      const data = await loadAllContent(ids.map((id) => `npcs/${id}`));
      ids.forEach((id, i) => (this.npcInfo[id] = data[i]));
      placements.forEach((p) => this.addNpc(p));

      objects.filter((o) => tiledProperty(o, 'action') && !tiledProperty(o, 'npc')).forEach((o) => this.addThing(o));
    } catch (error) {
      this.showProblem(error);
    }
    this.physics.add.collider(this.player.sprite, this.npcs);
    this.applyMood(this.runner?.mood(this.mapKey));

    this.ready = true;
    if (this.levelId) {
      save.markLevelStarted(this.levelId);
      if (this.runner) this.runner.run();
      else this.playLevelBriefing();
    }
  }

  /** An NPC: solid, and talks when Sivart presses Space next to them. */
  addNpc({ npc: id, x, y, dialogue, action }) {
    const info = this.npcInfo[id];
    const npc = this.npcs.create(x, y, info.sprite, info.frame ?? 0);
    npc.setDepth(npc.y);
    npc.setData({ npcId: id, label: `Talk to ${info.name}`, dialogue, action });
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

  /** Levels without a quest file can still have a one-time briefing conversation. */
  async playLevelBriefing() {
    try {
      const level = await loadContent(`levels/${this.levelId}`);
      if (level.briefing && !save.hasFlag(`${this.levelId}:briefed`)) {
        save.setFlag(`${this.levelId}:briefed`);
        await this.playConversation(level.briefing);
      }
    } catch (error) {
      this.showProblem(error);
    }
  }

  applyMood(mood) {
    const look = MOODS[mood];
    if (!look) return;
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, look.color, look.alpha)
      .setOrigin(0).setScrollFactor(0).setDepth(100000);
  }

  // ---------- Every frame ----------

  update() {
    if (!this.ready) return;
    this.player.update();
    this.checkAreas();

    const target = this.nearestInteractable();
    const canAct = !this.busy && !this.menuOpen;
    this.hint.hidden = !(canAct && target);
    if (target) this.hint.textContent = `Space or tap: ${target.getData('label')}`;

    if (Phaser.Input.Keyboard.JustDown(this.talkKey) && !this.menuOpen) {
      if (this.dialogue.isOpen) this.dialogue.advance();
      else if (this.card.isOpen) this.card.advance();
      else this.interact(target);
    }
  }

  /** Notices when Sivart walks into a named area: shows its name and tells the quest. */
  checkAreas() {
    const { x, y } = this.player.sprite;
    const inside = this.areas.filter((a) => a.rect.contains(x, y));
    const ids = inside.map((a) => a.id);
    if (ids.join() === this.areaIds.join()) return;
    const entered = inside.filter((a) => !this.areaIds.includes(a.id));
    this.areaIds = ids;
    if (entered.length) {
      // Show the most specific place (the smallest area) Sivart just walked into.
      const smallest = entered.reduce((a, b) => (a.rect.width * a.rect.height <= b.rect.width * b.rect.height ? a : b));
      this.hud.flash(smallest.label);
      this.runner?.onEnterAreas(ids);
    }
  }

  /** A tap or click on the game: advance dialogue/cards, or use the thing that was tapped. */
  handleTap(pointer) {
    if (!this.ready || this.menuOpen) return;
    if (this.dialogue.isOpen) {
      this.dialogue.advance();
      return;
    }
    const near = this.nearestInteractable();
    if (near?.getBounds().contains(pointer.worldX, pointer.worldY)) this.interact(near);
  }

  /** Can Sivart use this NPC/thing right now? */
  isUsable(thing) {
    const npcId = thing.getData('npcId');
    return Boolean(thing.getData('dialogue') || thing.getData('action') || (npcId && this.runner?.isTalkTarget(npcId)));
  }

  /** The closest usable NPC or object within reach, or undefined if nothing is close. */
  nearestInteractable() {
    const { x, y } = this.player.sprite;
    let best;
    let bestDistance = TALK_DISTANCE;
    for (const thing of this.interactables) {
      const distance = Phaser.Math.Distance.Between(x, y, thing.x, thing.y);
      if (distance <= bestDistance && this.isUsable(thing)) {
        best = thing;
        bestDistance = distance;
      }
    }
    return best;
  }

  /** Talk to an NPC or use an object. The quest gets first say; otherwise play its own lines. */
  async interact(target) {
    if (!target || this.busy || this.menuOpen) return;
    const npcId = target.getData('npcId');
    if (npcId && this.runner && (await this.runner.handleTalk(npcId))) return;
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

  // ---------- Tools the quest runner uses ----------

  /** Runs something that takes over the screen: Sivart stands still until it's done. */
  async present(show) {
    this.busyCount += 1;
    this.player.freeze();
    try {
      return await show();
    } finally {
      this.busyCount -= 1;
      if (!this.busy && !this.menuOpen) this.player.unfreeze();
    }
  }

  playConversation(dialogueRef) {
    return this.present(async () => {
      try {
        const lines = await loadDialogue(dialogueRef);
        // Look up display names for everyone who speaks in this conversation.
        const speakerIds = [...new Set(lines.map((line) => line.speaker))];
        const speakerData = await Promise.all(
          speakerIds.map((id) => loadContent(`npcs/${id}`).catch(() => ({ name: id })))
        );
        const speakers = Object.fromEntries(speakerIds.map((id, i) => [id, speakerData[i]]));
        await this.dialogue.play(lines, speakers);
      } catch (error) {
        console.error(error);
        await this.dialogue.play([{ speaker: 'Problem loading content', text: error.message }]);
      }
    });
  }

  showCard(card) {
    return this.present(() => this.card.show(card));
  }

  showChoice(prompt, choices) {
    return this.present(() => ChoiceBox.open(prompt, choices));
  }

  setObjective(objective) {
    this.hud.setObjective(objective);
  }

  flashMessage(text, seconds) {
    this.hud.flash(text, seconds);
  }

  flashScreen() {
    return this.present(() => new Promise((resolve) => {
      this.cameras.main.flash(600, 255, 255, 255);
      this.time.delayedCall(700, resolve);
    }));
  }

  /** Puts a bobbing "!" over each NPC (by id) and area (by id) Sivart should go to. */
  setMarkers({ npcs, areas }) {
    this.markers.forEach((m) => m.destroy());
    const places = [
      ...this.interactables.filter((t) => npcs.includes(t.getData('npcId'))).map((t) => ({ x: t.x, y: t.y - 14 })),
      ...this.areas.filter((a) => areas.includes(a.id)).map((a) => ({ x: a.rect.centerX, y: a.rect.centerY })),
    ];
    this.markers = places.map(({ x, y }) => {
      const marker = this.add.sprite(x, y, 'marker', 0).setDepth(100001);
      this.tweens.add({ targets: marker, y: y - 3, duration: 450, yoyo: true, repeat: -1 });
      return marker;
    });
  }

  npcName(id) {
    return this.npcInfo[id]?.name ?? id;
  }

  areaLabel(id) {
    return this.areas.find((a) => a.id === id)?.label ?? id;
  }

  currentAreaIds() {
    return this.areaIds;
  }

  /** Goes to another map (fading out first), staying in the same level. */
  travel(mapKey, spawn) {
    this.ready = false;
    this.player.freeze();
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('World', { mapKey, levelId: this.levelId, spawn });
    });
  }

  // ----- Menus -----

  /** Runs a menu while the world is paused. */
  async withMenu(openMenu) {
    if (this.menuOpen || this.busy) return null;
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
      if (!levelId) return;
      const { mapKey, spawn } = await QuestRunner.entryPoint(levelId);
      this.scene.start('World', { mapKey, levelId, spawn });
    } catch (error) {
      this.showProblem(error);
    }
  }

  async openPauseMenu() {
    const choice = await this.withMenu(() => PauseMenu.open({ inLevel: Boolean(this.levelId) }));
    if (choice === 'archive') this.scene.start('World', { mapKey: HUB_MAP, levelId: null });
    if (choice === 'title') this.scene.start('Title');
  }

  /** Shows a content error in the dialogue box instead of silently breaking. */
  showProblem(error) {
    console.error(error);
    return this.present(() => this.dialogue.play([{ speaker: 'Problem loading content', text: error.message }]));
  }
}
