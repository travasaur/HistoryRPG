# HistoryRPG: Sivart's Journey — Project Instructions

## What this is
A solo, story-driven, top-down 2D pixel RPG (Stardew Valley / Pokémon feel) that reviews
California 8th grade U.S. History standards. The player is Sivart, a present-day 8th grader
pulled into the past by the Living Record. Graham Senoj (Mr. Senoj) runs the Archive hub.

The design is fully documented. Treat these files as the source of truth:
- `docs/bible.md` — game design bible (structure, systems, characters, content rules)
- `docs/level4-script.md` — full script and data for the prototype level (Level 4)

Never invent historical content, quotes, or sources. If something is missing from the docs,
add a clearly marked `TODO:` placeholder and tell me.

## Who I am
I'm a middle school teacher, not a professional developer. Explain what you built in plain
language, keep code readable and commented, and tell me exactly how to test each change.

## Tech stack
- Phaser 3 (latest 3.x), plain JavaScript (ES modules), Vite for the dev server and build
- Maps made in Tiled, exported as JSON (`.tmj`), 16×16 tiles, scaled up in game
- Phaser config: `pixelArt: true`, fixed internal resolution, scale to fit the window
- Deploy as a static site on GitHub Pages; no backend, no accounts, no database

## Hard constraints
- Must run smoothly on school Chromebooks in a browser: keep textures small, avoid heavy
  effects, target 60 fps but stay playable at 30.
- Saving: autosave to `localStorage`, plus a copy-and-paste save code (compress the save JSON
  with LZ-String, include a version number and checksum, show a friendly error on bad codes).
  The save stores IDs and flags, not long text; cap Chronicle Trial answers in length.
- All history content lives in `content/` as JSON. Game code reads it; adding a quest, NPC,
  or source should never require changing engine code.
- Placeholder art (simple shapes or a CC0 pack) until real art is added. Keep art in
  `assets/`, never hard-code file paths in game logic beyond a single asset manifest.
- Reading support: adjustable text size, short dialogue boxes, tap-to-define glossary words.

## Content rules (from the bible)
- Sivart witnesses history; he never changes real outcomes, never plays as an enslaver,
  and never chooses to harm real people.
- Lite combat targets only fictional threats (Fade wisps, wildlife, bandits). Around soldiers
  and slave catchers, use stealth and evasion only.
- Violence is described, not shown in gameplay detail.
- Written answers use CER: Claim, Evidence, Reasoning.

## Folder layout
```
content/   acts, levels, quests, npcs, dialogue, debates, sources, minigames, study (JSON)
maps/      Tiled maps and tilesets
assets/    sprites, portraits, UI, audio
src/       game code (scenes, systems, ui)
docs/      bible.md, level4-script.md
```

## How we work
1. Build one milestone at a time (see below). Don't start the next one until I confirm.
2. At the end of each milestone: summarize what changed, list the files, and give me a short
   step-by-step test checklist.
3. Commit to Git after each working milestone with a clear message.
4. If a request conflicts with this file or the docs, ask before proceeding.

## Milestones (prototype: Level 4)
1. Engine skeleton: Phaser + Vite project, top-down movement, Tiled map loading, collisions,
   camera, dialogue box, JSON content loader, one test map.
2. Archive hub stub, level select, autosave, and save code.
3. Level 4 maps with placeholder art, NPCs placed, main-quest beats running from JSON.
4. Learning systems: Archive Pages, Living Record journal, Perspective Lens, Weigh the
   Evidence, Timeline Weave, Debate Duel, Chronicle Trial (CER).
5. Side quests, History Mystery, Ret Siger content, minigames, stealth section, Study Mode.
6. Art pass (real tilesets, sprites, portraits) and sound.
7. Student playtest fixes; then generalize systems for the next level.
