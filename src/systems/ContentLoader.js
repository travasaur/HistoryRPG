/**
 * Content loader: the one way the game reads history content.
 *
 * All content (dialogue, NPCs, quests, Archive Pages, debates...) lives in the content/
 * folder as JSON files. Ask for a file by its path inside content/, without ".json":
 *
 *   const convo = await loadContent('dialogue/test');   // reads content/dialogue/test.json
 *   const senoj = await loadContent('npcs/senoj');      // reads content/npcs/senoj.json
 *
 * Each file is downloaded once and then remembered, so asking again is instant.
 * If a file is missing or has a typo in it, the error message says which file and why.
 */

const cache = new Map();

export function loadContent(path) {
  if (!cache.has(path)) {
    const request = fetchJson(path);
    cache.set(path, request);
    // Don't remember failures, so fixing the file and trying again works.
    request.catch(() => cache.delete(path));
  }
  return cache.get(path);
}

/** Loads several content files at once. Resolves to an array in the same order. */
export function loadAllContent(paths) {
  return Promise.all(paths.map(loadContent));
}

/**
 * Loads the lines of one conversation. Two ways to name a conversation:
 *
 *   'test'                 the whole file content/dialogue/test.json (its "lines")
 *   'L04_beat1#kit'        the "kit" conversation inside content/dialogue/L04_beat1.json
 *                          (files with several conversations keep them under "conversations")
 */
export async function loadDialogue(ref) {
  const [file, name] = ref.split('#');
  const data = await loadContent(`dialogue/${file}`);
  const lines = name ? data.conversations?.[name] : data.lines;
  if (!Array.isArray(lines)) {
    throw new Error(`Conversation "${name ?? file}" was not found in content/dialogue/${file}.json.`);
  }
  return lines;
}

async function fetchJson(path) {
  const url = `${import.meta.env.BASE_URL}content/${path}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Content file "content/${path}.json" was not found (error ${response.status}).`);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Content file "content/${path}.json" has a JSON mistake: ${error.message}`);
  }
}
