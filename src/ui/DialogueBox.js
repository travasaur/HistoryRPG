/**
 * Dialogue box: shows one line at a time with the speaker's name.
 *
 * It's plain HTML on top of the game (not drawn by Phaser), so the text stays sharp at
 * any screen size and can be resized for reading support later.
 *
 * Usage:
 *   await dialogueBox.play(lines, speakers);  // resolves when the last line is dismissed
 *
 * `lines` is an array like [{ speaker: "senoj", text: "..." }].
 * `speakers` maps speaker ids to NPC data, e.g. { senoj: { name: "Mr. Senoj" } }.
 * The scene calls advance() when Space is pressed or the game is tapped; tapping the box
 * itself also advances.
 */
export class DialogueBox {
  constructor(parentElement) {
    this.el = document.createElement('div');
    this.el.className = 'dialogue';
    this.el.hidden = true;
    this.el.setAttribute('role', 'dialog');
    this.el.setAttribute('aria-live', 'polite');

    this.speakerEl = document.createElement('div');
    this.speakerEl.className = 'dialogue__speaker';
    this.textEl = document.createElement('div');
    this.textEl.className = 'dialogue__text';
    const hint = document.createElement('div');
    hint.className = 'dialogue__hint';
    hint.textContent = 'Space or tap ▶';

    this.el.append(this.speakerEl, this.textEl, hint);
    parentElement.appendChild(this.el);

    this.el.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.advance();
    });

    this.lines = [];
    this.speakers = {};
    this.index = 0;
    this.onFinished = null;
  }

  get isOpen() {
    return !this.el.hidden;
  }

  play(lines, speakers = {}) {
    if (!lines?.length) return Promise.resolve();
    this.lines = lines;
    this.speakers = speakers;
    this.index = 0;
    this.el.hidden = false;
    this.showCurrentLine();
    return new Promise((resolve) => (this.onFinished = resolve));
  }

  /** Go to the next line, or close the box after the last one. */
  advance() {
    if (!this.isOpen) return;
    this.index++;
    if (this.index < this.lines.length) {
      this.showCurrentLine();
      return;
    }
    this.el.hidden = true;
    const finished = this.onFinished;
    this.onFinished = null;
    finished?.();
  }

  showCurrentLine() {
    const line = this.lines[this.index];
    // Show the speaker's display name; fall back to the raw id if there's no NPC file.
    const name = this.speakers[line.speaker]?.name ?? line.speaker ?? '';
    this.speakerEl.textContent = name;
    this.speakerEl.hidden = !name;
    this.textEl.replaceChildren(...withEmphasis(line.text));
  }
}

/**
 * Turns *words in stars* into italics, like the script does
 * ("They're taxing *our* paper?"). Everything else stays plain text.
 */
function withEmphasis(text) {
  return String(text)
    .split(/\*([^*]+)\*/)
    .map((part, i) => {
      if (i % 2 === 0) return document.createTextNode(part);
      const em = document.createElement('em');
      em.textContent = part;
      return em;
    });
}
