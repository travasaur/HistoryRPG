/**
 * Per-device settings (not part of the save code): right now just text size.
 * Stored in the browser so a student's choice sticks on that Chromebook.
 */

const STORAGE_KEY = 'historyrpg.settings';
export const TEXT_SIZES = [16, 20, 24, 28, 32]; // pixels
const DEFAULT_TEXT_SIZE = 20;

let settings = { textSize: DEFAULT_TEXT_SIZE };

try {
  settings = { ...settings, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
} catch {
  // No saved settings or storage blocked: keep defaults.
}

/** Applies the text size to all HTML text UI (dialogue, menus). */
function applyTextSize() {
  document.getElementById('ui-root')?.style.setProperty('--text-size', `${settings.textSize}px`);
}

export function getTextSize() {
  return settings.textSize;
}

/** Moves text size up (+1) or down (-1) one step. Returns the new size. */
export function changeTextSize(step) {
  const index = TEXT_SIZES.indexOf(settings.textSize);
  const next = TEXT_SIZES[Math.min(TEXT_SIZES.length - 1, Math.max(0, (index === -1 ? 1 : index) + step))];
  settings.textSize = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage blocked: the size still applies until the page is closed.
  }
  applyTextSize();
  return next;
}

applyTextSize();
