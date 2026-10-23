import { save } from '../systems/SaveSystem.js';
import { changeTextSize, getTextSize } from '../systems/Settings.js';
import { h, uiRoot } from './dom.js';

/**
 * Pause menu: text size, save code, and leaving the level.
 *
 * Usage:
 *   const choice = await PauseMenu.open({ inLevel: true });
 *   // choice is 'resume', 'archive', or 'title'
 */
export const PauseMenu = {
  open({ inLevel }) {
    return new Promise((resolve) => {
      const finish = (choice) => {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        resolve(choice);
      };
      const onKey = (event) => {
        if (event.key === 'Escape') finish('resume');
      };
      document.addEventListener('keydown', onKey);

      // --- Text size ---
      const sizeLabel = h('span', { class: 'text-size__value' }, `${getTextSize()}`);
      const resize = (step) => (sizeLabel.textContent = `${changeTextSize(step)}`);

      // --- Save code ---
      const copyStatus = h('p', { class: 'muted', 'aria-live': 'polite' });
      const codeBox = h('textarea', { class: 'code-box', rows: '4', readOnly: true, 'aria-label': 'Your save code' });
      const codeSection = h('div', { class: 'panel__section', hidden: true },
        h('p', {}, 'Copy this code and paste it somewhere safe, like a Google Doc or an email to yourself. ' +
          'On another computer, choose "I have a save code" on the title screen.'),
        codeBox,
        h('button', { class: 'btn', onclick: () => copyCode(codeBox, copyStatus) }, 'Copy'),
        copyStatus,
      );
      const showCode = () => {
        codeBox.value = save.toCode();
        codeSection.hidden = false;
        copyStatus.textContent = '';
      };

      const overlay = h('div', { class: 'overlay' },
        h('div', { class: 'panel', role: 'dialog', 'aria-label': 'Paused' },
          h('h2', {}, 'Paused'),
          h('button', { class: 'btn btn--big', onclick: () => finish('resume') }, 'Resume'),
          h('div', { class: 'panel__row text-size' },
            h('span', {}, 'Text size'),
            h('button', { class: 'btn btn--small', onclick: () => resize(-1), 'aria-label': 'Smaller text' }, 'A−'),
            sizeLabel,
            h('button', { class: 'btn btn--small', onclick: () => resize(1), 'aria-label': 'Bigger text' }, 'A+'),
          ),
          h('button', { class: 'btn', onclick: showCode }, 'Get save code'),
          codeSection,
          inLevel && h('button', { class: 'btn', onclick: () => finish('archive') }, 'Return to the Archive'),
          h('button', { class: 'btn btn--plain', onclick: () => finish('title') }, 'Quit to title screen'),
          !save.storageWorks && h('p', { class: 'panel__error' },
            "This browser isn't letting the game autosave (maybe a private window). Use a save code to keep your progress."),
        ),
      );
      uiRoot().append(overlay);
    });
  },
};

/** Copies the save code, with a fallback for browsers that block the clipboard. */
async function copyCode(codeBox, status) {
  try {
    await navigator.clipboard.writeText(codeBox.value);
    status.textContent = 'Copied! Now paste it somewhere safe.';
  } catch {
    codeBox.focus();
    codeBox.select();
    status.textContent = 'Press Ctrl+C to copy the highlighted code.';
  }
}
