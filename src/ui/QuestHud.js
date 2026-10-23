import { h } from './dom.js';

/**
 * The always-visible bits of quest UI:
 *   - the objective box (top left): which beat, and what to do next
 *   - the place-name banner (top center) that pops up when Sivart walks into an area
 *   - quick messages ("Correct!") in the same banner spot
 */
export class QuestHud {
  constructor(parentElement) {
    this.beatEl = h('div', { class: 'objective__beat' });
    this.textEl = h('div', { class: 'objective__text' });
    this.listEl = h('ul', { class: 'objective__list' });
    this.objective = h('div', { class: 'objective', hidden: true, 'aria-live': 'polite' },
      this.beatEl, this.textEl, this.listEl);
    this.banner = h('div', { class: 'banner', hidden: true, 'aria-live': 'polite' });
    parentElement.append(this.objective, this.banner);
    this.bannerTimer = null;
  }

  /**
   * Shows what to do next, or hides the box when `objective` is null.
   * objective = { beat: 'Beat 3: Pay Up', text: 'Visit the four stations',
   *               list: [{ label: 'Docks: Sugar Act, 1764', done: true }, ...] }
   */
  setObjective(objective) {
    this.objective.hidden = !objective;
    if (!objective) return;
    this.beatEl.textContent = objective.beat ?? '';
    this.textEl.textContent = objective.text ?? '';
    this.listEl.replaceChildren(...(objective.list ?? []).map((item) =>
      h('li', { class: item.done ? 'done' : '' }, `${item.done ? '✓' : '○'} ${item.label}`)));
  }

  /** Pops up a short message at the top of the screen for a few seconds. */
  flash(text, seconds = 2.5) {
    clearTimeout(this.bannerTimer);
    this.banner.textContent = text;
    this.banner.hidden = false;
    this.bannerTimer = setTimeout(() => (this.banner.hidden = true), seconds * 1000);
  }

  destroy() {
    clearTimeout(this.bannerTimer);
    this.objective.remove();
    this.banner.remove();
  }
}
