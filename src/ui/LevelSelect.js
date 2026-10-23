import { loadContent, loadAllContent } from '../systems/ContentLoader.js';
import { save } from '../systems/SaveSystem.js';
import { h, uiRoot } from './dom.js';

/**
 * Level select ("the Living Record"): every level grouped by act, read from
 * content/acts.json and content/levels/*.json.
 *
 * - All levels are listed (the bible says all are open from the start).
 * - Levels without a map yet show "Coming soon" and can't be entered.
 * - The first playable level that isn't complete gets a "Suggested next" marker,
 *   following textbook order.
 *
 * Usage:  const levelId = await LevelSelect.open();   // null if closed without choosing
 */
export const LevelSelect = {
  async open() {
    const { acts } = await loadContent('acts');
    const levelIds = acts.flatMap((act) => act.levels);
    const levels = await loadAllContent(levelIds.map((id) => `levels/${id}`));
    const byId = Object.fromEntries(levels.map((level) => [level.id, level]));

    const isPlayable = (level) => Boolean(level.startMap);
    const suggested = levels.find((level) => isPlayable(level) && !save.isLevelComplete(level.id));

    return new Promise((resolve) => {
      const finish = (choice) => {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        resolve(choice);
      };
      const onKey = (event) => {
        if (event.key === 'Escape') finish(null);
      };
      document.addEventListener('keydown', onKey);

      // Details of the selected level, shown under the list.
      const details = h('div', { class: 'level-details', 'aria-live': 'polite' });
      const showDetails = (level) => {
        details.replaceChildren(
          h('h3', {}, `Level ${level.number}: ${level.title}`),
          h('p', { class: 'muted' }, `${level.years} · Standards: ${level.standards.join(', ')}`),
          h('p', {}, h('strong', {}, 'Big question: '), level.question),
          h('p', { class: 'muted' }, level.focus),
          isPlayable(level)
            ? h('button', { class: 'btn btn--big', onclick: () => finish(level.id) }, 'Enter this page')
            : h('p', { class: 'badge badge--soon' }, 'This page is still being written. Coming soon!'),
        );
      };

      const levelButton = (level) => {
        const badges = [];
        if (level.id === suggested?.id) badges.push(h('span', { class: 'badge badge--next' }, 'Suggested next'));
        if (save.isLevelComplete(level.id)) badges.push(h('span', { class: 'badge badge--done' }, 'Complete'));
        else if (save.levelProgress(level.id)?.started) badges.push(h('span', { class: 'badge' }, 'Started'));
        if (!isPlayable(level)) badges.push(h('span', { class: 'badge badge--soon' }, 'Coming soon'));
        return h('button', {
          class: `level-row${level.id === suggested?.id ? ' level-row--next' : ''}${isPlayable(level) ? '' : ' level-row--soon'}`,
          onclick: () => showDetails(level),
        },
          h('span', { class: 'level-row__number' }, level.number),
          h('span', { class: 'level-row__title' }, level.title, h('span', { class: 'muted' }, ` · ${level.years}`)),
          h('span', { class: 'level-row__badges' }, badges),
        );
      };

      const overlay = h('div', { class: 'overlay' },
        h('div', { class: 'panel panel--wide', role: 'dialog', 'aria-label': 'Choose a level' },
          h('div', { class: 'panel__header' },
            h('h2', {}, 'The Living Record'),
            h('button', { class: 'btn btn--plain', onclick: () => finish(null), 'aria-label': 'Close' }, 'Close ✕'),
          ),
          details,
          acts.map((act) => h('section', { class: 'act' },
            h('h3', { class: 'act__title' }, `Act ${act.id}${act.bonus ? ' (bonus)' : ''}: ${act.title}`),
            act.levels.map((id) => levelButton(byId[id])),
          )),
        ),
      );
      uiRoot().append(overlay);

      showDetails(suggested ?? levels[0]);
    });
  },
};
