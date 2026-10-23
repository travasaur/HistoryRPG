# HistoryRPG: Sivart's Journey

A top-down history RPG reviewing California 8th grade U.S. History. See `CLAUDE.md` for
project rules and `docs/` for the design bible and the Level 4 script.

**Play it:** https://travasaur.github.io/HistoryRPG/ (updates automatically a minute or two
after every push to `main`; see the repository's Actions tab).

## Run it

You need Node.js installed. In this folder:

```bash
npm install      # first time only
npm run dev      # then open http://localhost:5173
```

Add `?debug` to the address (http://localhost:5173/?debug) to see collision boxes.

**Controls:** arrow keys or WASD to walk · Space (or tap) to talk, use things, and advance
dialogue · Esc (or the ☰ button) for the pause menu: text size, save code, leave a level.

**Saving:** progress autosaves in the browser. To move to another computer, open the pause
menu → Get save code → Copy, then on the other computer choose "I have a save code" on the
title screen.

**Testing shortcut:** with `?debug` in the address, press `]` to skip a "talk to" or "go to"
step.

## Editing the story

- A level's main quest is one file: `content/quests/L04_main.json`. Each beat lists its map,
  where its NPCs stand, and its steps in order. The `_howTo` note at the top explains the
  step types.
- What people say is in `content/dialogue/L04_beat1.json` (and so on), one file per beat. A
  quest step points at a conversation like `"L04_beat1#kit"` (file `#` conversation name).
  Put `*stars*` around a word to make it italic.
- Each character's name and placeholder picture is in `content/npcs/<id>.json`.

`npm run build` makes the finished website in `dist/` (for GitHub Pages).

## Where things live

| Folder | What's in it |
| --- | --- |
| `content/` | All history content as JSON (dialogue, NPCs, and later quests, sources...) |
| `maps/` | Tiled maps (`.tmj`) and tileset images |
| `assets/` | Sprites, portraits, UI, audio, plus `manifest.json`, the one list of asset file paths |
| `src/` | Game code: `scenes/`, `systems/`, `ui/` |
| `tools/` | Helper scripts (e.g. regenerating placeholder art) |
