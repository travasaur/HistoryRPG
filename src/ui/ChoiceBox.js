import { h, uiRoot } from './dom.js';

/**
 * A question with numbered answer buttons (Record checks and story choices).
 * Students click/tap an answer or press its number key.
 *
 * Usage:  const index = await ChoiceBox.open('Why...?', ['answer A', 'answer B']);
 */
export const ChoiceBox = {
  open(prompt, choices) {
    return new Promise((resolve) => {
      const pick = (index) => {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        resolve(index);
      };
      const onKey = (event) => {
        const number = Number(event.key);
        if (number >= 1 && number <= choices.length) pick(number - 1);
      };
      document.addEventListener('keydown', onKey);

      const overlay = h('div', { class: 'overlay overlay--low' },
        h('div', { class: 'panel panel--choice', role: 'dialog', 'aria-label': prompt },
          h('p', { class: 'choice__prompt' }, prompt),
          choices.map((choice, i) => h('button', { class: 'choice', onclick: () => pick(i) },
            h('span', { class: 'choice__number' }, i + 1),
            h('span', {}, choice),
          )),
        ),
      );
      uiRoot().append(overlay);
    });
  },
};
