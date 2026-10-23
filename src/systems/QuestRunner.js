import { loadContent } from './ContentLoader.js';
import { save } from './SaveSystem.js';

/**
 * Quest runner: plays a level's main quest from its JSON file (content/quests/*.json).
 *
 * A quest is a list of beats; each beat has a map, the NPCs standing on it, and a list of
 * steps that run one after another. The step types are explained in the quest file's
 * "_howTo" note. Progress is saved after every step, so leaving and coming back picks up
 * where the student left off.
 *
 * The runner decides WHAT happens; the World scene decides HOW it looks (dialogue box,
 * cards, markers). The scene gives the runner a small set of tools:
 *   playConversation, showCard, showChoice, setObjective, setMarkers, flashMessage,
 *   flashScreen, travel, npcName, areaLabel, currentAreaIds
 */

const todoTitle = (milestone) => (milestone ? `Coming in Milestone ${milestone}` : 'Coming later');

export class QuestRunner {
  /**
   * Where Sivart should appear when he enters a level: the map of the beat he's on,
   * or the level's free-roam map once the quest is finished.
   */
  static async entryPoint(levelId) {
    const level = await loadContent(`levels/${levelId}`);
    if (!level.quest) return { mapKey: level.startMap, spawn: null };
    const quest = await loadContent(`quests/${level.quest}`);
    if (save.isQuestDone(levelId, quest.id)) return { mapKey: level.startMap, spawn: null };
    const progress = save.questProgress(levelId);
    const beat = quest.beats.find((b) => b.id === progress?.beat) ?? quest.beats[0];
    return { mapKey: progress?.map ?? beat.map, spawn: progress?.spawn ?? beat.spawn };
  }

  /** Makes a runner for this level, or returns null if the level has no unfinished quest. */
  static async create(scene, levelId) {
    const level = await loadContent(`levels/${levelId}`);
    if (!level.quest) return null;
    const quest = await loadContent(`quests/${level.quest}`);
    if (save.isQuestDone(levelId, quest.id)) return null;
    return new QuestRunner(scene, levelId, quest);
  }

  constructor(scene, levelId, quest) {
    this.scene = scene;
    this.levelId = levelId;
    this.quest = quest;
    this.stopped = false;
    this.pending = null; // the talk/goto steps we're waiting on, if any

    const saved = save.questProgress(levelId);
    const savedBeat = quest.beats.find((b) => b.id === saved?.beat);
    const beat = savedBeat ?? quest.beats[0];
    this.pos = savedBeat
      ? { ...saved, done: [...saved.done] }
      : { quest: quest.id, beat: beat.id, step: 0, done: [], map: beat.map, spawn: beat.spawn };
  }

  get beat() {
    return this.quest.beats.find((b) => b.id === this.pos.beat);
  }

  /** NPCs the current beat puts on the map: [{ npc: 'kit', spot: 'kit_shop' }, ...] */
  beatNpcs() {
    return this.beat?.npcs ?? [];
  }

  /** The lighting for this map in this beat ('night', 'gloom', 'dawn'), if any. */
  mood(mapKey) {
    return this.beat?.mood?.[mapKey] ?? null;
  }

  stop() {
    this.stopped = true;
    this.pending = null;
  }

  // ---------- The main loop ----------

  async run() {
    this.saveProgress();
    while (!this.stopped) {
      const beat = this.beat;
      const atBeatStart = this.pos.step === 0 && this.pos.done.length === 0;
      if (atBeatStart && beat.showIntro !== false && !this.introShown) {
        this.introShown = true;
        await this.scene.showCard({ title: beat.title, text: beat.place, kind: 'intro' });
        if (this.stopped) return;
      }

      const step = beat.steps[this.pos.step];
      if (!step) {
        this.startNextBeat();
        return;
      }

      const result = await this.runStep(step);
      if (this.stopped || result === 'left-map') return;
      this.pos.step += 1;
      this.pos.done = [];
      this.saveProgress();
    }
  }

  async runStep(step) {
    const scene = this.scene;
    switch (step.type) {
      case 'dialogue':
        return scene.playConversation(step.dialogue);

      case 'card':
        return scene.showCard({ title: step.title, text: step.text });

      case 'todo':
        return scene.showCard({ title: todoTitle(step.milestone), text: step.text, kind: 'todo' });

      case 'flash':
        return scene.flashScreen();

      case 'talk':
      case 'goto':
        return this.waitFor([step], step.objective);

      case 'anyOrder':
        return this.waitFor(step.steps, step.objective);

      case 'check':
        return this.runCheck(step);

      case 'choice': {
        const index = await scene.showChoice(step.prompt, step.choices);
        save.setFlag(`${step.id}:${index}`);
        return null;
      }

      case 'travel': {
        this.pos.step += 1;
        this.pos.done = [];
        this.pos.map = step.map;
        this.pos.spawn = step.spawn ?? null;
        // If this was the beat's last step, go straight into the next beat (one map load, not two).
        const next = this.quest.beats[this.quest.beats.indexOf(this.beat) + 1];
        if (this.pos.step >= this.beat.steps.length && next) {
          this.pos = { quest: this.quest.id, beat: next.id, step: 0, done: [], map: next.map, spawn: next.spawn };
        }
        this.saveProgress();
        scene.travel(this.pos.map, this.pos.spawn);
        return 'left-map';
      }

      default:
        return scene.showCard({
          title: 'Problem in the quest file',
          text: `content/quests/${this.quest.id}.json has a step type "${step.type}" the game doesn't know.`,
          kind: 'todo',
        });
    }
  }

  /** Record check: ask until the right answer is chosen, giving a hint after wrong ones. */
  async runCheck(step) {
    for (;;) {
      const index = await this.scene.showChoice(step.prompt, step.choices);
      if (this.stopped) return;
      if (index === step.answer) {
        this.scene.flashMessage('✓ Correct! The Record accepts your answer.');
        return;
      }
      if (step.hint) await this.scene.playConversation(step.hint);
      else await this.scene.showCard({ title: 'Not quite', text: 'Read the question again and try another answer.', kind: 'hint' });
      if (this.stopped) return;
    }
  }

  startNextBeat() {
    const index = this.quest.beats.indexOf(this.beat);
    const next = this.quest.beats[index + 1];
    if (!next) {
      save.completeQuest(this.levelId, this.quest.id);
      this.scene.setObjective(null);
      this.scene.setMarkers({ npcs: [], areas: [] });
      this.scene.flashMessage('Main quest complete!', 4);
      this.stop();
      return;
    }
    this.pos = { quest: this.quest.id, beat: next.id, step: 0, done: [], map: next.map, spawn: next.spawn };
    this.saveProgress();
    this.scene.travel(next.map, next.spawn);
  }

  saveProgress() {
    save.setQuestProgress(this.levelId, this.pos);
  }

  // ---------- Waiting for the player (talk to someone / go somewhere) ----------

  /** Resolves once every one of `subSteps` is done (in any order). */
  waitFor(subSteps, objective) {
    return new Promise((resolve) => {
      this.pending = { subSteps, objective, resolve };
      if (this.remaining().length === 0) {
        this.finishWaiting();
        return;
      }
      this.refreshObjective();
      // Already standing in the place we're asked to go? That counts.
      this.onEnterAreas(this.scene.currentAreaIds());
    });
  }

  keyOf(subStep) {
    return subStep.id ?? `${subStep.type}:${subStep.npc ?? subStep.area}`;
  }

  remaining() {
    return this.pending ? this.pending.subSteps.filter((s) => !this.pos.done.includes(this.keyOf(s))) : [];
  }

  /** True if talking to this NPC moves the quest forward right now. */
  isTalkTarget(npcId) {
    return this.remaining().some((s) => s.type === 'talk' && s.npc === npcId);
  }

  /** Called when Sivart talks to an NPC. Returns true if the quest handled it. */
  async handleTalk(npcId) {
    const subStep = this.remaining().find((s) => s.type === 'talk' && s.npc === npcId);
    if (!subStep) return false;
    await this.scene.playConversation(subStep.dialogue);
    if (!this.stopped) this.complete(subStep);
    return true;
  }

  /** Called when Sivart walks into one or more named areas. */
  async onEnterAreas(areaIds) {
    for (const subStep of this.remaining()) {
      if (subStep.type !== 'goto' || !areaIds.includes(subStep.area)) continue;
      if (subStep.dialogue) await this.scene.playConversation(subStep.dialogue);
      if (!this.stopped) this.complete(subStep);
    }
  }

  complete(subStep) {
    if (!this.pending) return;
    this.pos.done.push(this.keyOf(subStep));
    this.saveProgress();
    if (this.remaining().length === 0) this.finishWaiting();
    else this.refreshObjective();
  }

  finishWaiting() {
    const { resolve } = this.pending;
    this.pending = null;
    this.scene.setObjective(null);
    this.scene.setMarkers({ npcs: [], areas: [] });
    resolve();
  }

  /** Updates the objective box and the "!" markers to match what's left to do. */
  refreshObjective() {
    const { subSteps, objective } = this.pending;
    const left = this.remaining();
    const describe = (s) => (s.type === 'talk' ? `Talk to ${this.scene.npcName(s.npc)}` : `Go to ${this.scene.areaLabel(s.area)}`);
    this.scene.setObjective({
      beat: this.beat.title,
      text: objective ?? describe(left[0]),
      list: subSteps.length > 1
        ? subSteps.map((s) => ({ label: s.label ?? describe(s), done: !left.includes(s) }))
        : [],
    });
    this.scene.setMarkers({
      npcs: left.filter((s) => s.type === 'talk').map((s) => s.npc),
      areas: left.filter((s) => s.type === 'goto').map((s) => s.area),
    });
  }

  /** Debug helper (?debug, then press ]): finishes the talk/goto step being waited on. */
  debugSkip() {
    for (const subStep of this.remaining()) this.complete(subStep);
  }
}
