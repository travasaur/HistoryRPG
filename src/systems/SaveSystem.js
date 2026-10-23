import LZString from 'lz-string';

/**
 * Save system: autosave on this device, plus a copy-and-paste save code for moving
 * between school and home.
 *
 * What gets saved is small on purpose: IDs and true/false flags, never long text
 * (see "Save system" in docs/bible.md). Example:
 *
 *   { v: 1,
 *     levels: { L04: { started: true, quests: [], trial: null,
 *                      progress: { quest: "L04_main", beat: "b3_pay_up", step: 1,
 *                                  done: ["docks"], map: "l04-boston", spawn: "shop" } } },
 *     pages: [], retSiger: {}, periods: 0, flags: [] }
 *
 * "quests" lists finished quests; "progress" is where Sivart is in the current one.
 *
 * A save code looks like "HRPG-" followed by letters and numbers. Inside it is the save
 * data, its version number, and a checksum (a fingerprint of the data), so a code that was
 * copied only partly or mistyped is caught with a friendly message instead of breaking.
 */

export const SAVE_VERSION = 1;
const STORAGE_KEY = 'historyrpg.save';
const CODE_PREFIX = 'HRPG-';
const MAX_TRIAL_ANSWER = 1000; // characters; keeps save codes short (used from Milestone 4)

/** A brand-new, empty save. */
function emptySave() {
  return { v: SAVE_VERSION, levels: {}, pages: [], retSiger: {}, periods: 0, flags: [] };
}

/**
 * Cleans up save data read from storage or a code: fills in anything missing and drops
 * anything with the wrong shape, so the rest of the game can trust it.
 */
function normalize(raw) {
  const clean = emptySave();
  if (!raw || typeof raw !== 'object') return clean;
  const strings = (list) => (Array.isArray(list) ? list.filter((x) => typeof x === 'string') : []);

  if (raw.levels && typeof raw.levels === 'object') {
    for (const [id, level] of Object.entries(raw.levels)) {
      if (!level || typeof level !== 'object') continue;
      clean.levels[id] = {
        started: Boolean(level.started),
        quests: strings(level.quests),
        trial: typeof level.trial === 'string' ? level.trial.slice(0, MAX_TRIAL_ANSWER) : null,
        progress: normalizeProgress(level.progress),
      };
    }
  }
  clean.pages = strings(raw.pages);
  clean.flags = strings(raw.flags);
  if (raw.retSiger && typeof raw.retSiger === 'object') {
    for (const [id, done] of Object.entries(raw.retSiger)) clean.retSiger[id] = Boolean(done);
  }
  clean.periods = Math.min(6, Math.max(0, Math.floor(Number(raw.periods) || 0)));
  return clean;
}

/** Cleans up "where am I in the quest" data, or returns null if there isn't any. */
function normalizeProgress(p) {
  if (!p || typeof p !== 'object' || typeof p.beat !== 'string') return null;
  const text = (value) => (typeof value === 'string' ? value : null);
  return {
    quest: text(p.quest),
    beat: p.beat,
    step: Math.max(0, Math.floor(Number(p.step) || 0)),
    done: Array.isArray(p.done) ? p.done.filter((x) => typeof x === 'string') : [],
    map: text(p.map),
    spawn: text(p.spawn),
  };
}

/** A short fingerprint of a piece of text (FNV-1a hash). Any change to the text changes it. */
function checksum(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

class SaveSystem {
  constructor() {
    this.data = emptySave();
    this.storageWorks = true;
  }

  /** Reads the autosave from this device. Returns true if there was one. */
  loadFromDevice() {
    try {
      const text = localStorage.getItem(STORAGE_KEY);
      if (!text) return false;
      this.data = normalize(JSON.parse(text));
      return true;
    } catch (error) {
      console.warn('Could not read the autosave:', error);
      return false;
    }
  }

  hasDeviceSave() {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  }

  /** Starts over with an empty save (and autosaves it). */
  startNew() {
    this.data = emptySave();
    this.autosave();
  }

  /** Writes the current progress to this device. Called after every change. */
  autosave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.storageWorks = true;
    } catch (error) {
      // Can happen in private/incognito windows. The save code still works.
      this.storageWorks = false;
      console.warn('Autosave failed; use a save code to keep progress.', error);
    }
  }

  // ----- Progress helpers (the rest of the game uses these, not this.data directly) -----

  levelProgress(levelId) {
    return this.data.levels[levelId] ?? null;
  }

  /** The save entry for a level, created empty if needed. */
  level(levelId) {
    return (this.data.levels[levelId] ??= { started: false, quests: [], trial: null, progress: null });
  }

  markLevelStarted(levelId) {
    const level = this.level(levelId);
    if (level.started) return;
    level.started = true;
    this.autosave();
  }

  questProgress(levelId) {
    return this.data.levels[levelId]?.progress ?? null;
  }

  /** Saves where Sivart is in a quest. Called after every quest step. */
  setQuestProgress(levelId, progress) {
    this.level(levelId).progress = { ...progress, done: [...progress.done] };
    this.autosave();
  }

  isQuestDone(levelId, questId) {
    return Boolean(this.data.levels[levelId]?.quests.includes(questId));
  }

  completeQuest(levelId, questId) {
    const level = this.level(levelId);
    if (!level.quests.includes(questId)) level.quests.push(questId);
    level.progress = null;
    this.autosave();
  }

  /** A level counts as complete once its Chronicle Trial is done (built in Milestone 4). */
  isLevelComplete(levelId) {
    return Boolean(this.data.levels[levelId]?.trial);
  }

  hasFlag(flag) {
    return this.data.flags.includes(flag);
  }

  setFlag(flag) {
    if (this.hasFlag(flag)) return;
    this.data.flags.push(flag);
    this.autosave();
  }

  // ----- Save codes -----

  /** Turns the current progress into a save code students can copy. */
  toCode() {
    const dataText = JSON.stringify(this.data);
    const packet = JSON.stringify({ v: SAVE_VERSION, sum: checksum(dataText), data: this.data });
    return CODE_PREFIX + LZString.compressToEncodedURIComponent(packet);
  }

  /**
   * Loads progress from a pasted save code.
   * Returns { ok: true } or { ok: false, message: "a friendly explanation" }.
   * On failure the current progress is left untouched.
   */
  loadFromCode(code) {
    const trimmed = String(code ?? '').replace(/\s+/g, ''); // ignore spaces and line breaks
    if (!trimmed) return { ok: false, message: 'Paste your save code into the box first.' };

    const notACode = {
      ok: false,
      message: "That doesn't look like a HistoryRPG save code. Make sure you copied the whole thing, starting with HRPG-.",
    };
    if (!trimmed.toUpperCase().startsWith(CODE_PREFIX)) return notACode;

    let packet;
    try {
      const text = LZString.decompressFromEncodedURIComponent(trimmed.slice(CODE_PREFIX.length));
      packet = JSON.parse(text);
    } catch {
      packet = null;
    }
    if (!packet || typeof packet !== 'object' || !packet.data) {
      return { ok: false, message: 'This save code is missing a piece or has a typo. Try copying it again, all the way to the end.' };
    }
    if (typeof packet.v !== 'number' || packet.v > SAVE_VERSION) {
      return { ok: false, message: 'This save code came from a newer version of the game. Try refreshing this page, then paste the code again.' };
    }
    if (packet.sum !== checksum(JSON.stringify(packet.data))) {
      return { ok: false, message: 'This save code is missing a piece or has a typo. Try copying it again, all the way to the end.' };
    }
    // Older versions would be upgraded here once SAVE_VERSION goes above 1.

    this.data = normalize(packet.data);
    this.autosave();
    return { ok: true };
  }
}

/** The one save system the whole game shares. */
export const save = new SaveSystem();
