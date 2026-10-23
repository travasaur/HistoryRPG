# HistoryRPG: Sivart's Journey

A top-down history RPG reviewing California 8th grade U.S. History. See `CLAUDE.md` for
project rules and `docs/` for the design bible and the Level 4 script.

## Run it

You need Node.js installed. In this folder:

```bash
npm install      # first time only
npm run dev      # then open http://localhost:5173
```

Add `?debug` to the address (http://localhost:5173/?debug) to see collision boxes.

`npm run build` makes the finished website in `dist/` (for GitHub Pages).

## Where things live

| Folder | What's in it |
| --- | --- |
| `content/` | All history content as JSON (dialogue, NPCs, and later quests, sources...) |
| `maps/` | Tiled maps (`.tmj`) and tileset images |
| `assets/` | Sprites, portraits, UI, audio, plus `manifest.json`, the one list of asset file paths |
| `src/` | Game code: `scenes/`, `systems/`, `ui/` |
| `tools/` | Helper scripts (e.g. regenerating placeholder art) |
