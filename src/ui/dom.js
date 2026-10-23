/**
 * Tiny helper for building HTML elements in the menus.
 *
 *   h('button', { class: 'btn', onclick: () => alert('hi') }, 'Click me')
 *
 * - "class" sets the CSS class
 * - keys starting with "on" add event listeners (onclick, oninput...)
 * - hidden / disabled / value / readOnly are set directly on the element
 * - everything else becomes an HTML attribute
 * Children can be elements or plain text; null/false children are skipped.
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (key === 'class') el.className = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else if (['hidden', 'disabled', 'value', 'readOnly'].includes(key)) el[key] = value;
    else el.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

/** The layer all HTML UI goes into. */
export function uiRoot() {
  return document.getElementById('ui-root');
}
