// Makes the placeholder art and maps.
//
// Run with:  npm run make-placeholders
//
// You normally never need to run this again. It exists so the placeholder files can be
// rebuilt if they get lost or need a change. Once real art arrives (Milestone 6) and maps
// are drawn in Tiled, this script can be deleted. NOTE: running it overwrites the maps
// listed below, so don't run it after you start editing those maps in Tiled.
//
// It writes:
//   maps/tilesets/placeholder.png          16 tiles (see the TILES list below)
//   assets/sprites/player-placeholder.png  Sivart, 4 frames: down, left, right, up
//   assets/sprites/senoj-placeholder.png   Mr. Senoj, 1 frame
//   assets/sprites/record-placeholder.png  the Living Record (a book), 1 frame
//   assets/sprites/people-placeholder.png  9 frames of placeholder townspeople
//   assets/sprites/marker-placeholder.png  the "!" quest marker
//   maps/test-map.tmj                      a small outdoor test map (Milestone 1)
//   maps/archive.tmj                       the Archive hub (a library room)
//   maps/l04-frontier.tmj                  Level 4: Ohio frontier (fort + trading post)
//   maps/l04-boston.tmj                    Level 4: Boston and the harbor
//   maps/l04-philadelphia.tmj              Level 4: Philadelphia (Carpenters' Hall)
//   maps/l04-lexington.tmj                 Level 4: the road and Lexington Green
//
// The Level 4 maps are rough placeholders: they put the script's places on one map so the
// quest can be played. They are NOT geographically accurate.

import fs from 'node:fs';
import zlib from 'node:zlib';

// ---------- Tiny PNG writer (no extra libraries needed) ----------

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** A simple pixel canvas. Colors are '#rrggbb' strings; untouched pixels are transparent. */
class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8Array(width * height * 4);
  }

  set(x, y, hex) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = (y * this.width + x) * 4;
    this.pixels[i] = parseInt(hex.slice(1, 3), 16);
    this.pixels[i + 1] = parseInt(hex.slice(3, 5), 16);
    this.pixels[i + 2] = parseInt(hex.slice(5, 7), 16);
    this.pixels[i + 3] = 255;
  }

  rect(x, y, w, h, hex) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.set(xx, yy, hex);
  }

  save(path) {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(this.width, 0);
    header.writeUInt32BE(this.height, 4);
    header[8] = 8; // bits per channel
    header[9] = 6; // color type: RGBA
    const rowBytes = this.width * 4;
    const raw = Buffer.alloc((rowBytes + 1) * this.height);
    for (let y = 0; y < this.height; y++) {
      raw[y * (rowBytes + 1)] = 0; // filter type: none
      Buffer.from(this.pixels.buffer, y * rowBytes, rowBytes).copy(raw, y * (rowBytes + 1) + 1);
    }
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngChunk('IHDR', header),
      pngChunk('IDAT', zlib.deflateSync(raw)),
      pngChunk('IEND', Buffer.alloc(0)),
    ]);
    fs.writeFileSync(path, png);
    console.log('wrote', path);
  }
}

// ---------- Tileset ----------

const T = 16;

// Each tile: [name, solid?]. The order here is the order in the PNG; a tile's Tiled "gid"
// number is its position + 1 (0 means "no tile").
const TILES = [
  ['grass', false], ['path', false], ['wall', true], ['water', true],
  ['floor', false], ['shelf', true], ['desk', true], ['tree', true],
  ['cobble', false], ['brick', true], ['roof', true], ['door', true],
  ['logs', true], ['dock', false], ['ship', true], ['mud', false],
];
const GID = Object.fromEntries(TILES.map(([name], i) => [name.toUpperCase(), i + 1]));
const { GRASS, PATH, WALL, WATER, FLOOR, SHELF, DESK, TREE, COBBLE, BRICK, ROOF, DOOR, LOGS, DOCK, SHIP, MUD } = GID;

const tiles = new Canvas(T * TILES.length, T);
const tileX = (gid) => (gid - 1) * T;

/** Little marks in fixed spots so flat tiles don't look completely flat. */
function speckle(gid, color, spots, w = 1, h = 1) {
  for (const [x, y] of spots) tiles.rect(tileX(gid) + x, y, w, h, color);
}

/** Rows of bricks/planks: horizontal lines every `rowH` pixels with offset vertical joints. */
function rows(gid, base, line, rowH, jointA, jointB) {
  tiles.rect(tileX(gid), 0, T, T, base);
  for (let row = 0; row * rowH < T; row++) {
    tiles.rect(tileX(gid), row * rowH + rowH - 1, T, 1, line);
    const j = row % 2 === 0 ? jointA : jointB;
    tiles.rect(tileX(gid) + j, row * rowH, 1, rowH - 1, line);
    if (j + 8 < T) tiles.rect(tileX(gid) + j + 8, row * rowH, 1, rowH - 1, line);
  }
}

// grass
tiles.rect(tileX(GRASS), 0, T, T, '#5a9e4b');
speckle(GRASS, '#78bd5f', [[2, 3], [9, 1], [13, 6], [5, 9], [11, 12], [3, 14], [7, 5]], 1, 2);
// dirt path
tiles.rect(tileX(PATH), 0, T, T, '#c8a46a');
speckle(PATH, '#a8844e', [[3, 2], [10, 4], [6, 10], [13, 13], [1, 8]]);
// stone wall
rows(WALL, '#7d7d8c', '#4f4f5c', 4, 3, 7);
// water
tiles.rect(tileX(WATER), 0, T, T, '#3f7fbf');
speckle(WATER, '#7fb3e6', [[2, 3], [9, 7], [4, 12], [11, 13]], 3, 1);
// wood floor
rows(FLOOR, '#a0703f', '#7a5230', 4, 5, 11);
// bookshelf
tiles.rect(tileX(SHELF), 0, T, T, '#4a2f1b');
const spines = ['#b03a2e', '#2e6fb0', '#d4a017', '#3a8f4b', '#7d3cb0', '#e0e0d0'];
for (const shelfY of [2, 9]) {
  for (let i = 0; i < 6; i++) tiles.rect(tileX(SHELF) + 2 + i * 2, shelfY, 2, 5, spines[(i + shelfY) % 6]);
}
// desk
tiles.rect(tileX(DESK), 0, T, T, '#a0703f');
tiles.rect(tileX(DESK), 2, T, 9, '#c08a52');
tiles.rect(tileX(DESK), 11, T, 3, '#6b4423');
// tree (round canopy on grass, with a trunk)
tiles.rect(tileX(TREE), 0, T, T, '#5a9e4b');
tiles.rect(tileX(TREE) + 7, 11, 2, 4, '#5b3a1e');
tiles.rect(tileX(TREE) + 3, 2, 10, 9, '#2f6b2f');
tiles.rect(tileX(TREE) + 2, 4, 12, 5, '#2f6b2f');
tiles.rect(tileX(TREE) + 5, 3, 4, 3, '#3f8a3f');
// cobblestone street
tiles.rect(tileX(COBBLE), 0, T, T, '#9a9188');
speckle(COBBLE, '#7c746c', [[1, 1], [6, 2], [11, 1], [3, 6], [9, 7], [14, 5], [1, 11], [6, 12], [12, 11]], 3, 2);
// brick building front
rows(BRICK, '#a14a35', '#6e2f22', 4, 2, 6);
// roof
tiles.rect(tileX(ROOF), 0, T, T, '#4b4f63');
for (let y = 3; y < T; y += 4) tiles.rect(tileX(ROOF), y, T, 1, '#363948');
// door (in a brick front)
rows(DOOR, '#a14a35', '#6e2f22', 4, 2, 6);
tiles.rect(tileX(DOOR) + 4, 3, 8, 13, '#4a2f1b');
tiles.rect(tileX(DOOR) + 10, 9, 1, 2, '#f1c40f');
// log wall (stockade); the gaps between logs are see-through so the ground shows
for (let x = 0; x < T; x += 4) {
  tiles.rect(tileX(LOGS) + x, 1, 3, 15, '#7a5230');
  tiles.rect(tileX(LOGS) + x + 1, 0, 1, 1, '#7a5230');
}
// dock planks
rows(DOCK, '#b98b55', '#8a6338', 4, 4, 12);
// ship hull
tiles.rect(tileX(SHIP), 0, T, T, '#3f7fbf');
tiles.rect(tileX(SHIP), 2, T, 12, '#5b3a1e');
tiles.rect(tileX(SHIP), 4, T, 1, '#3d2614');
tiles.rect(tileX(SHIP), 9, T, 1, '#3d2614');
// mud
tiles.rect(tileX(MUD), 0, T, T, '#7b5e3b');
speckle(MUD, '#5f4628', [[2, 2], [9, 3], [5, 8], [12, 10], [3, 13]], 2, 1);

tiles.save('maps/tilesets/placeholder.png');

// ---------- Characters ----------

/** Draws a simple chibi person into a 16x16 frame starting at frameX. */
function drawPerson(canvas, frameX, { hair, skin, shirt, pants, facing = 'down', hat }) {
  const px = (x, y, c) => canvas.set(frameX + x, y, c);
  const r = (x, y, w, h, c) => canvas.rect(frameX + x, y, w, h, c);
  r(5, 2, 6, 3, hair); // top of head
  r(5, 5, 6, 4, skin); // face
  if (facing === 'up') r(5, 5, 6, 3, hair); // back of the head
  if (facing === 'left') r(9, 5, 2, 2, hair);
  if (facing === 'right') r(5, 5, 2, 2, hair);
  if (hat) { r(4, 2, 8, 2, hat); r(6, 1, 4, 1, hat); }
  // eyes
  if (facing === 'down') { px(6, 6, '#222222'); px(9, 6, '#222222'); }
  if (facing === 'left') px(6, 6, '#222222');
  if (facing === 'right') px(9, 6, '#222222');
  r(4, 9, 8, 4, shirt); // body
  r(3, 9, 1, 3, skin); // arms
  r(12, 9, 1, 3, skin);
  r(5, 13, 6, 2, pants); // legs
  r(5, 15, 2, 1, '#222222'); // shoes
  r(9, 15, 2, 1, '#222222');
}

const sivartColors = { hair: '#3b2a1a', skin: '#e0ac69', shirt: '#2f6fd6', pants: '#33333d' };
const player = new Canvas(T * 4, T);
['down', 'left', 'right', 'up'].forEach((facing, i) => drawPerson(player, i * T, { ...sivartColors, facing }));
player.save('assets/sprites/player-placeholder.png');

const senoj = new Canvas(T, T);
drawPerson(senoj, 0, { hair: '#9a9a9a', skin: '#c68642', shirt: '#8a2b2b', pants: '#2b2b33' });
senoj.save('assets/sprites/senoj-placeholder.png');

// Placeholder townspeople. NPC files in content/npcs pick one with "frame".
// 0 Kit · 1 Washington · 2 redcoat · 3 settler/farmer · 4 Lenape trader ·
// 5 clerk/official · 6 merchant/keeper · 7 stamp distributor · 8 delegate
const PEOPLE = [
  { hair: '#6b4423', skin: '#f1c27d', shirt: '#8b5a2b', pants: '#3d3d3d' },
  { hair: '#cfc8b8', skin: '#f1c27d', shirt: '#2b4c8c', pants: '#e8e1cf', hat: '#1e1e1e' },
  { hair: '#2b2b2b', skin: '#e0ac69', shirt: '#c0392b', pants: '#e8e1cf', hat: '#1e1e1e' },
  { hair: '#5a3a1a', skin: '#d9a066', shirt: '#6b8e23', pants: '#5b4636' },
  { hair: '#1b1b1b', skin: '#b5835a', shirt: '#a0522d', pants: '#5b4636' },
  { hair: '#8a8a8a', skin: '#f1c27d', shirt: '#3d3d3d', pants: '#2b2b33' },
  { hair: '#6b4423', skin: '#8d5524', shirt: '#7d3c98', pants: '#2b2b33' },
  { hair: '#3b2a1a', skin: '#f1c27d', shirt: '#16a085', pants: '#2b2b33', hat: '#1e1e1e' },
  { hair: '#e8e8e8', skin: '#e0ac69', shirt: '#2c3e50', pants: '#2b2b33' },
];
const people = new Canvas(T * PEOPLE.length, T);
PEOPLE.forEach((colors, i) => drawPerson(people, i * T, colors));
people.save('assets/sprites/people-placeholder.png');

// The Living Record: a closed book with a glowing gold edge
const record = new Canvas(T, T);
record.rect(3, 4, 10, 9, '#5b2a86'); // cover
record.rect(12, 5, 2, 8, '#f3e3b5'); // pages
record.rect(3, 4, 10, 1, '#f1c40f'); // gold trim
record.rect(3, 12, 10, 1, '#f1c40f');
record.rect(6, 7, 4, 3, '#f1c40f'); // emblem
record.save('assets/sprites/record-placeholder.png');

// Quest marker: a yellow "!" bubble that floats over whoever Sivart should find next
const marker = new Canvas(T, T);
marker.rect(5, 1, 6, 12, '#3b2f2f');
marker.rect(6, 2, 4, 10, '#f1c40f');
marker.rect(7, 3, 2, 5, '#3b2f2f');
marker.rect(7, 9, 2, 2, '#3b2f2f');
marker.rect(7, 13, 2, 2, '#3b2f2f'); // little tail pointing down
marker.save('assets/sprites/marker-placeholder.png');

// ---------- Map helpers ----------

// Every map embeds the same tileset (Phaser can't read separate .tsx files).
// The tileset "name" must match a key in assets/manifest.json.
const placeholderTileset = {
  firstgid: 1,
  name: 'placeholder',
  image: 'tilesets/placeholder.png',
  imagewidth: T * TILES.length,
  imageheight: T,
  tilewidth: T,
  tileheight: T,
  tilecount: TILES.length,
  columns: TILES.length,
  margin: 0,
  spacing: 0,
  // Any tile with collides = true is solid. Edit this in Tiled's tileset panel.
  tiles: TILES.flatMap(([, solid], i) =>
    solid ? [{ id: i, properties: [{ name: 'collides', type: 'bool', value: true }] }] : []),
};

/**
 * A blank map to draw on. Ground is the bottom layer; Walls holds solid things drawn on
 * top (trees, buildings). Objects holds spawn points, NPC spots, and named areas.
 *
 * Object naming the game understands:
 *   spawn_<name>   where Sivart can appear (quests say "spawn": "<name>")
 *   spot_<name>    where a quest can place an NPC ("spot": "<name>")
 *   rectangles with an "area" property: named places; the label pops up when Sivart
 *   walks in, and quests can say "go to" them
 */
function newMap(width, height, groundTile) {
  const ground = new Array(width * height).fill(groundTile);
  const walls = new Array(width * height).fill(0);
  const objects = [];
  const inside = (x, y) => x >= 0 && y >= 0 && x < width && y < height;
  const m = {
    width, height, ground, walls, objects,
    fill(layer, x, y, w, h, gid) {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (inside(xx, yy)) layer[yy * width + xx] = gid;
    },
    get(layer, x, y) {
      return inside(x, y) ? layer[y * width + x] : 0;
    },
    border(gid) {
      m.fill(walls, 0, 0, width, 1, gid);
      m.fill(walls, 0, height - 1, width, 1, gid);
      m.fill(walls, 0, 0, 1, height, gid);
      m.fill(walls, width - 1, 0, 1, height, gid);
    },
    /** A building seen from above: roof rows, then a brick front with a door. */
    building(x, y, w, h, doorX) {
      m.fill(walls, x, y, w, h - 1, ROOF);
      m.fill(walls, x, y + h - 1, w, 1, BRICK);
      m.fill(walls, doorX, y + h - 1, 1, 1, DOOR);
    },
    point(name, x, y, properties = {}) {
      objects.push({
        id: objects.length + 1, name, type: '', point: true,
        x: x * T + T / 2, y: y * T + T / 2, width: 0, height: 0, rotation: 0, visible: true,
        properties: Object.entries(properties).map(([k, v]) => ({ name: k, type: 'string', value: v })),
      });
    },
    spawn(name, x, y) { m.point(`spawn_${name}`, x, y); },
    spot(name, x, y) { m.point(`spot_${name}`, x, y); },
    area(id, label, x, y, w, h) {
      objects.push({
        id: objects.length + 1, name: id, type: '',
        x: x * T, y: y * T, width: w * T, height: h * T, rotation: 0, visible: true,
        properties: [{ name: 'area', type: 'string', value: id }, { name: 'label', type: 'string', value: label }],
      });
    },
    /** Scatters trees with a repeatable pattern, skipping the rectangles in `keepClear`. */
    scatterTrees(chance, keepClear, seed = 1) {
      let s = seed;
      const random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const clear = keepClear.some(([cx, cy, cw, ch]) => x >= cx && x < cx + cw && y >= cy && y < cy + ch);
          if (!clear && random() < chance && !m.get(walls, x, y)) walls[y * width + x] = TREE;
        }
      }
    },
    save(path) {
      const tileLayer = (id, name, data) => ({ id, name, type: 'tilelayer', width, height, data, x: 0, y: 0, opacity: 1, visible: true });
      const map = {
        type: 'map', version: '1.10', tiledversion: '1.11.0',
        orientation: 'orthogonal', renderorder: 'right-down', infinite: false,
        width, height, tilewidth: T, tileheight: T, compressionlevel: -1,
        nextlayerid: 4, nextobjectid: objects.length + 1,
        tilesets: [placeholderTileset],
        layers: [
          tileLayer(1, 'Ground', ground),
          tileLayer(2, 'Walls', walls),
          { id: 3, name: 'Objects', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects },
        ],
      };
      fs.writeFileSync(path, JSON.stringify(map, null, 1));
      console.log('wrote', path);
    },
  };
  return m;
}

// ---------- Test map (Milestone 1): outdoors, 30 x 20 ----------
{
  const m = newMap(30, 20, GRASS);
  m.fill(m.ground, 1, 10, 28, 1, PATH);
  m.fill(m.ground, 15, 1, 1, 18, PATH);
  m.fill(m.ground, 20, 3, 5, 4, WATER);
  m.border(WALL);
  m.fill(m.walls, 4, 12, 7, 1, WALL);
  m.fill(m.walls, 4, 17, 7, 1, WALL);
  m.fill(m.walls, 4, 12, 1, 6, WALL);
  m.fill(m.walls, 10, 12, 1, 6, WALL);
  m.fill(m.walls, 7, 12, 1, 1, 0);
  for (const [x, y] of [[6, 4], [7, 4], [19, 14], [20, 14], [21, 14], [25, 11]]) m.fill(m.walls, x, y, 1, 1, WALL);
  m.point('player_start', 3, 4);
  m.point('senoj', 11, 7, { npc: 'senoj', dialogue: 'test' });
  m.save('maps/test-map.tmj');
}

// ---------- Archive hub: a library room, 20 x 13 ----------
{
  const m = newMap(20, 13, FLOOR);
  m.border(WALL);
  for (let x = 1; x < 19; x++) if (x < 8 || x > 11) m.fill(m.walls, x, 1, 1, 1, SHELF);
  for (const x of [2, 3, 4, 15, 16, 17]) { m.fill(m.walls, x, 5, 1, 1, SHELF); m.fill(m.walls, x, 8, 1, 1, SHELF); }
  m.fill(m.walls, 9, 4, 2, 1, DESK);
  m.point('player_start', 9, 10);
  m.spawn('start', 9, 10);
  m.point('senoj', 11, 3, { npc: 'senoj', dialogue: 'archive_greeting' });
  // Interactive objects: "sprite" is a manifest key, "action" is what happens when used,
  // "label" is the hint shown when Sivart is close.
  m.point('living_record', 9, 4, { sprite: 'living-record', action: 'level_select', label: 'Open the Living Record' });
  m.save('maps/archive.tmj');
}

// ---------- Level 4: Ohio frontier, 44 x 30 ----------
// West: Fort Necessity in a muddy meadow (Beat 1). North: the woods to scout.
// East: a frontier trading post (Beat 2).
{
  const m = newMap(44, 30, GRASS);
  m.border(TREE);
  m.fill(m.ground, 6, 12, 15, 13, MUD); // muddy meadow
  // Small log stockade with a gate on the south side
  m.fill(m.walls, 10, 15, 6, 1, LOGS);
  m.fill(m.walls, 10, 20, 6, 1, LOGS);
  m.fill(m.walls, 10, 15, 1, 6, LOGS);
  m.fill(m.walls, 15, 15, 1, 6, LOGS);
  m.fill(m.walls, 12, 20, 2, 1, 0);
  // Paths: north into the woods, east to the trading post
  m.fill(m.ground, 12, 3, 1, 12, PATH);
  m.fill(m.ground, 12, 22, 23, 1, PATH);
  m.fill(m.ground, 34, 16, 1, 7, PATH);
  // Trading post
  m.building(32, 12, 6, 4, 34);
  m.scatterTrees(0.3, [
    [5, 11, 17, 15], // meadow and fort
    [6, 1, 12, 6], // lookout clearing
    [11, 2, 4, 13], // path north
    [11, 21, 25, 3], // path east
    [33, 15, 3, 9], // path to the post door
    [28, 9, 15, 16], // trading post grounds
  ]);
  m.spawn('fort', 12, 22);
  m.spawn('post', 31, 21);
  m.point('player_start', 12, 22);
  m.spot('kit_fort', 11, 18);
  m.spot('washington_fort', 14, 17);
  m.spot('officer_post', 35, 17);
  m.spot('settler_post', 32, 18);
  m.spot('trader_post', 38, 18);
  m.area('fort_necessity', 'Fort Necessity', 8, 13, 11, 11);
  m.area('french_lookout', 'The woods north of the fort', 7, 2, 10, 4);
  m.area('trading_post', 'Frontier trading post', 29, 10, 13, 14);
  m.save('maps/l04-frontier.tmj');
}

// ---------- Level 4: Boston and the harbor, 50 x 34 ----------
{
  const m = newMap(50, 34, COBBLE);
  // Harbor water to the east and south, with a wooden waterfront
  m.fill(m.ground, 43, 0, 7, 34, WATER);
  m.fill(m.ground, 0, 31, 50, 3, WATER);
  m.fill(m.ground, 40, 1, 3, 30, DOCK);
  m.fill(m.ground, 43, 14, 7, 2, DOCK); // Long Wharf
  m.fill(m.ground, 43, 24, 7, 2, DOCK); // Griffin's Wharf
  m.fill(m.walls, 44, 22, 5, 2, SHIP); // ships tied up at Griffin's Wharf
  m.fill(m.walls, 44, 26, 5, 2, SHIP);
  // Stone edge on the land sides
  m.fill(m.walls, 0, 0, 43, 1, WALL);
  m.fill(m.walls, 0, 0, 1, 31, WALL);
  // Buildings
  m.building(5, 3, 6, 4, 7); // Kit's print shop
  m.building(27, 3, 6, 4, 29); // tavern
  m.building(16, 12, 8, 5, 19); // Custom House
  m.building(5, 12, 6, 5, 7);
  m.building(27, 12, 6, 5, 29);
  m.building(27, 22, 6, 5, 29);
  m.building(3, 23, 5, 6, 5); // Old North Church
  m.building(10, 24, 5, 4, 12);
  m.building(17, 25, 5, 4, 19);
  m.fill(m.ground, 15, 3, 10, 7, PATH); // open market square
  m.spawn('shop', 8, 10);
  m.spawn('king_street', 12, 18);
  m.spawn('north_end', 15, 22);
  m.point('player_start', 8, 10);
  m.spot('kit_shop', 9, 8);
  m.spot('stamp_distributor', 6, 8);
  m.spot('clerk', 18, 6);
  m.spot('farmer', 21, 6);
  m.spot('sergeant', 28, 8);
  m.spot('tavern_keeper', 31, 8);
  m.spot('customs_officer', 41, 8);
  m.spot('merchant', 41, 10);
  m.spot('kit_king_street', 22, 18);
  m.spot('kit_north_end', 13, 22);
  m.area('print_shop', "Kit's print shop", 4, 2, 9, 8);
  m.area('market', 'The market', 15, 3, 10, 7);
  m.area('tavern', 'The tavern', 26, 2, 8, 8);
  m.area('docks', 'The docks', 38, 4, 5, 10);
  m.area('custom_house', 'The Custom House, King Street', 14, 11, 12, 9);
  m.area('long_wharf', 'Long Wharf', 43, 13, 7, 4);
  m.area('griffins_wharf', "Griffin's Wharf", 40, 21, 10, 8);
  m.area('old_north', 'Old North Church', 2, 22, 7, 9);
  m.area('north_end', 'The North End', 1, 21, 22, 10);
  m.save('maps/l04-boston.tmj');
}

// ---------- Level 4: Philadelphia, 26 x 16 ----------
{
  const m = newMap(26, 16, COBBLE);
  m.border(WALL);
  m.building(9, 3, 8, 5, 12); // Carpenters' Hall
  m.building(2, 9, 4, 4, 3);
  m.building(20, 9, 4, 4, 21);
  m.spawn('street', 12, 13);
  m.point('player_start', 12, 13);
  m.spot('delegate', 13, 9);
  m.area('carpenters_hall', "Carpenters' Hall", 7, 2, 12, 9);
  m.save('maps/l04-philadelphia.tmj');
}

// ---------- Level 4: the road to Lexington and Lexington Green, 36 x 24 ----------
{
  const m = newMap(36, 24, GRASS);
  m.border(TREE);
  m.fill(m.ground, 1, 12, 20, 1, PATH); // the road in from the west
  m.building(22, 1, 5, 4, 24);
  m.building(29, 18, 5, 4, 31);
  m.building(8, 6, 5, 4, 10);
  m.scatterTrees(0.15, [
    [0, 10, 22, 5], // the road
    [20, 5, 14, 14], // the green
    [21, 0, 7, 6], // house by the green
    [28, 17, 7, 6], // house by the green
    [7, 5, 7, 6], // house by the road
  ], 7);
  m.spawn('road', 2, 12);
  m.point('player_start', 2, 12);
  m.area('lexington_green', 'Lexington Green', 21, 6, 12, 12);
  m.save('maps/l04-lexington.tmj');
}
