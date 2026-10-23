import { h } from './dom.js';

/**
 * Full-screen story card: dates, time skips, and short scene descriptions between
 * conversations ("July 3, 1754. After a day of fighting in the rain...").
 *
 * Kinds of card:
 *   'story' (default)  a dated card from the script
 *   'intro'            the title card at the start of a beat
 *   'todo'             a "coming in a later milestone" notice, styled differently
 *   'hint'             a gentle nudge after a wrong answer
 *
 * Like the dialogue box, the scene calls advance() on Space or a tap; tapping the card
 * itself also advances. Usage:  await card.show({ title, text, kind });
 */
export class StoryCard {
  constructor(parentElement) {
    this.titleEl = h('div', { class: 'card__title' });
    this.textEl = h('p', { class: 'card__text' });
    this.tagEl = h('div', { class: 'card__tag' });
    this.box = h('div', { class: 'card', role: 'dialog', 'aria-live': 'polite' },
      this.tagEl, this.titleEl, this.textEl, h('div', { class: 'card__hint' }, 'Space or tap ▶'));
    this.el = h('div', { class: 'card-overlay', hidden: true }, this.box);
    this.el.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.advance();
    });
    parentElement.append(this.el);
    this.onClose = null;
  }

  get isOpen() {
    return !this.el.hidden;
  }

  show({ title = '', text = '', kind = 'story' }) {
    this.box.className = `card card--${kind}`;
    this.tagEl.textContent = kind === 'todo' ? 'Placeholder' : '';
    this.tagEl.hidden = kind !== 'todo';
    this.titleEl.textContent = title;
    this.titleEl.hidden = !title;
    this.textEl.textContent = text;
    this.el.hidden = false;
    return new Promise((resolve) => (this.onClose = resolve));
  }

  advance() {
    if (!this.isOpen) return;
    this.el.hidden = true;
    const close = this.onClose;
    this.onClose = null;
    close?.();
  }
}
