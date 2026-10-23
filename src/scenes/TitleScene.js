import Phaser from 'phaser';
import { save } from '../systems/SaveSystem.js';
import { h, uiRoot } from '../ui/dom.js';

/**
 * Title screen: Continue, New game, or paste a save code from another device.
 * Every option ends in the Archive hub.
 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const hasSave = save.hasDeviceSave();

    const errorBox = h('p', { class: 'panel__error', role: 'alert', hidden: true });
    const codeInput = h('textarea', {
      class: 'code-box',
      rows: '3',
      placeholder: 'Paste your save code here (it starts with HRPG-)',
      'aria-label': 'Save code',
      spellcheck: 'false',
    });
    const loadSection = h('div', { class: 'panel__section', hidden: true },
      h('label', {}, 'Have a save code from another computer?'),
      codeInput,
      errorBox,
      h('button', { class: 'btn', onclick: () => this.loadCode(codeInput.value, errorBox) }, 'Load save code'),
    );

    // "New game" asks first if it would erase existing progress on this device.
    const confirmNew = h('div', { class: 'panel__section', hidden: true },
      h('p', {}, 'Start over? This erases the progress saved on this computer. ' +
        'If you want to keep it, choose Continue and get your save code from the pause menu first.'),
      h('div', { class: 'panel__row' },
        h('button', { class: 'btn btn--danger', onclick: () => this.newGame() }, 'Yes, start over'),
        h('button', { class: 'btn btn--plain', onclick: () => (confirmNew.hidden = true) }, 'Cancel'),
      ),
    );

    this.menu = h('div', { class: 'overlay' },
      h('div', { class: 'panel panel--title' },
        h('h1', { class: 'title' }, 'HistoryRPG'),
        h('p', { class: 'subtitle' }, "Sivart's Journey"),
        hasSave && h('button', { class: 'btn btn--big', onclick: () => this.continueGame() }, 'Continue'),
        h('button', {
          class: hasSave ? 'btn' : 'btn btn--big',
          onclick: () => (hasSave ? (confirmNew.hidden = false) : this.newGame()),
        }, 'New game'),
        confirmNew,
        h('button', {
          class: 'btn btn--plain',
          onclick: () => {
            loadSection.hidden = !loadSection.hidden;
            if (!loadSection.hidden) codeInput.focus();
          },
        }, 'I have a save code'),
        loadSection,
      ),
    );
    uiRoot().append(this.menu);
    this.events.once('shutdown', () => this.menu.remove());
  }

  continueGame() {
    save.loadFromDevice();
    this.enterArchive();
  }

  newGame() {
    save.startNew();
    this.enterArchive();
  }

  loadCode(code, errorBox) {
    const result = save.loadFromCode(code);
    errorBox.hidden = true;
    if (!result.ok) {
      errorBox.textContent = result.message;
      errorBox.hidden = false;
      return;
    }
    this.enterArchive();
  }

  enterArchive() {
    // Leave the code box properly so the game's keyboard controls switch back on.
    document.activeElement?.blur();
    this.scene.start('World', { mapKey: 'archive', levelId: null });
  }
}
