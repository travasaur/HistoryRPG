// Makes the placeholder art and the test map for Milestone 1.
//
// Run with:  npm run make-placeholders
//
// You normally never need to run this again. It exists so the placeholder files can be
// rebuilt if they get lost. Once real art arrives (Milestone 6) and maps are drawn in
// Tiled, this script can be deleted.
//
// It writes:
//   maps/tilesets/placeholder.png        7 tiles: grass, path, stone wall, water,
//                                        wood floor, bookshelf, desk
//   assets/sprites/player-placeholder.png  Sivart, 4 frames: down, left, right, up
//   assets/sprites/senoj-placeholder.png   Mr. Senoj, 1 frame
//   assets/sprites/record-placeholder.png  the Living Record (a book), 1 frame
//   maps/test-map.tmj                    a small outdoor test map
//   maps/archive.tmj                     the Archive hub (a library room)

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

// ---------- Tileset: 7 tiles, each 16x16 ----------

const T = 16;
const TILE_COUNT = 7;
const tiles = new Canvas(T * TILE_COUNT, T);

// Tile 0: grass, with a few lighter blades in fixed spots
tiles.rect(0, 0, T, T, '#5a9e4b');
for (const [x, y] of [[2, 3], [9, 1], [13, 6], [5, 9], [11, 12], [3, 14], [7, 5]]) {
  tiles.set(x, y, '#78bd5f');
  tiles.set(x, y + 1, '#78bd5f');
}

// Tile 1: dirt path
tiles.rect(T, 0, T, T, '#c8a46a');
for (const [x, y] of [[3, 2], [10, 4], [6, 10], [13, 13], [1, 8]]) tiles.set(T + x, y, '#a8844e');

// Tile 2: stone wall (bricks with mortar lines)
tiles.rect(T * 2, 0, T, T, '#7d7d8c');
for (let row = 0; row < 4; row++) {
  tiles.rect(T * 2, row * 4 + 3, T, 1, '#4f4f5c');
  const offset = row % 2 === 0 ? 3 : 7;
  tiles.rect(T * 2 + offset, row * 4, 1, 3, '#4f4f5c');
  tiles.rect(T * 2 + offset + 8, row * 4, 1, 3, '#4f4f5c');
}

// Tile 3: water with little wave marks
tiles.rect(T * 3, 0, T, T, '#3f7fbf');
for (const [x, y] of [[2, 3], [9, 7], [4, 12], [11, 13]]) tiles.rect(T * 3 + x, y, 3, 1, '#7fb3e6');

// Tile 4: wood floor (planks)
tiles.rect(T * 4, 0, T, T, '#a0703f');
for (let row = 0; row < 4; row++) {
  tiles.rect(T * 4, row * 4 + 3, T, 1, '#7a5230');
  tiles.rect(T * 4 + (row % 2 === 0 ? 5 : 11), row * 4, 1, 3, '#7a5230');
}

// Tile 5: bookshelf (solid): dark wood frame with colored book spines
tiles.rect(T * 5, 0, T, T, '#4a2f1b');
const spines = ['#b03a2e', '#2e6fb0', '#d4a017', '#3a8f4b', '#7d3cb0', '#e0e0d0'];
for (const shelfY of [2, 9]) {
  for (let i = 0; i < 6; i++) tiles.rect(T * 5 + 2 + i * 2, shelfY, 2, 5, spines[(i + shelfY) % 6]);
}

// Tile 6: desk (solid): wooden top with a darker front edge
tiles.rect(T * 6, 0, T, T, '#a0703f');
tiles.rect(T * 6, 2, T, 9, '#c08a52');
tiles.rect(T * 6, 11, T, 3, '#6b4423');

tiles.save('maps/tilesets/placeholder.png');

// ---------- Characters ----------

/** Draws a simple chibi person into a 16x16 frame starting at frameX. */
function drawPerson(canvas, frameX, { hair, skin, shirt, pants, facing }) {
  const px = (x, y, c) => canvas.set(frameX + x, y, c);
  const r = (x, y, w, h, c) => canvas.rect(frameX + x, y, w, h, c);
  r(5, 2, 6, 3, hair); // top of head
  r(5, 5, 6, 4, skin); // face
  if (facing === 'up') r(5, 5, 6, 3, hair); // back of the head
  if (facing === 'left') r(9, 5, 2, 2, hair);
  if (facing === 'right') r(5, 5, 2, 2, hair);
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
drawPerson(senoj, 0, { hair: '#9a9a9a', skin: '#c68642', shirt: '#8a2b2b', pants: '#2b2b33', facing: 'down' });
senoj.save('assets/sprites/senoj-placeholder.png');

// The Living Record: a closed book with a glowing gold edge
const record = new Canvas(T, T);
record.rect(3, 4, 10, 9, '#5b2a86'); // cover
record.rect(12, 5, 2, 8, '#f3e3b5'); // pages
record.rect(3, 4, 10, 1, '#f1c40f'); // gold trim
record.rect(3, 12, 10, 1, '#f1c40f');
record.rect(6, 7, 4, 3, '#f1c40f'); // emblem
record.save('assets/sprites/record-placeholder.png');

// ---------- Maps (Tiled JSON) ----------

// Tiled "gid" numbers = tile index + 1. 0 means "no tile here".
const GRASS = 1, PATH = 2, WALL = 3, WATER = 4, FLOOR = 5, SHELF = 6, DESK = 7;

// Every map embeds the same tileset (Phaser can't read separate .tsx files).
// The tileset "name" must match a key in assets/manifest.json.
const placeholderTileset = {
  firstgid: 1,
  name: 'placeholder',
  image: 'tilesets/placeholder.png',
  imagewidth: T * TILE_COUNT,
  imageheight: T,
  tilewidth: T,
  tileheight: T,
  tilecount: TILE_COUNT,
  columns: TILE_COUNT,
  margin: 0,
  spacing: 0,
  // Any tile with collides = true is solid. Edit this in Tiled's tileset panel.
  tiles: [WALL, WATER, SHELF, DESK].map((gid) => ({
    id: gid - 1,
    properties: [{ name: 'collides', type: 'bool', value: true }],
  })),
};

/** A point object (spawn spot, NPC, or interactive thing) centered on a tile. */
const point = (id, name, tileX, tileY, properties = {}) => ({
  id, name, type: '', point: true,
  x: tileX * T + T / 2, y: tileY * T + T / 2, width: 0, height: 0,
  rotation: 0, visible: true,
  properties: Object.entries(properties).map(([key, value]) => ({ name: key, type: 'string', value })),
});

/** Builds a map with a Ground layer, a Walls layer, and an Objects layer, then saves it. */
function saveMap(path, width, height, ground, walls, objects) {
  const tileLayer = (id, name, data) => ({
    id, name, type: 'tilelayer', width, height, data, x: 0, y: 0, opacity: 1, visible: true,
  });
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
}

/** Empty grids for a new map, plus a helper to turn (x, y) into a grid position. */
function grids(width, height, groundTile) {
  return {
    ground: new Array(width * height).fill(groundTile),
    walls: new Array(width * height).fill(0),
    at: (x, y) => y * width + x,
  };
}

// --- Test map: outdoors, 30 x 20 tiles ---
{
  const W = 30, H = 20;
  const { ground, walls, at } = grids(W, H, GRASS);
  // Paths: one across, one down
  for (let x = 1; x < W - 1; x++) ground[at(x, 10)] = PATH;
  for (let y = 1; y < H - 1; y++) ground[at(15, y)] = PATH;
  // A pond (water is solid)
  for (let y = 3; y <= 6; y++) for (let x = 20; x <= 24; x++) ground[at(x, y)] = WATER;
  // Border walls all the way around
  for (let x = 0; x < W; x++) { walls[at(x, 0)] = WALL; walls[at(x, H - 1)] = WALL; }
  for (let y = 0; y < H; y++) { walls[at(0, y)] = WALL; walls[at(W - 1, y)] = WALL; }
  // A small building with a doorway on top
  for (let x = 4; x <= 10; x++) { walls[at(x, 12)] = WALL; walls[at(x, 17)] = WALL; }
  for (let y = 12; y <= 17; y++) { walls[at(4, y)] = WALL; walls[at(10, y)] = WALL; }
  walls[at(7, 12)] = 0;
  // A few loose wall blocks to bump into
  for (const [x, y] of [[6, 4], [7, 4], [19, 14], [20, 14], [21, 14], [25, 11]]) walls[at(x, y)] = WALL;

  saveMap('maps/test-map.tmj', W, H, ground, walls, [
    point(1, 'player_start', 3, 4),
    point(2, 'senoj', 11, 7, { npc: 'senoj', dialogue: 'test' }),
  ]);
}

// --- Archive hub: a library room, 20 x 13 tiles ---
{
  const W = 20, H = 13;
  const { ground, walls, at } = grids(W, H, FLOOR);
  // Stone walls around the room
  for (let x = 0; x < W; x++) { walls[at(x, 0)] = WALL; walls[at(x, H - 1)] = WALL; }
  for (let y = 0; y < H; y++) { walls[at(0, y)] = WALL; walls[at(W - 1, y)] = WALL; }
  // Bookshelves along the top wall, with a gap in the middle
  for (let x = 1; x < W - 1; x++) if (x < 8 || x > 11) walls[at(x, 1)] = SHELF;
  // Two short shelf rows on the sides
  for (const x of [2, 3, 4, 15, 16, 17]) { walls[at(x, 5)] = SHELF; walls[at(x, 8)] = SHELF; }
  // Mr. Senoj's desk in the middle of the room, where the Living Record sits
  for (const x of [9, 10]) walls[at(x, 4)] = DESK;

  saveMap('maps/archive.tmj', W, H, ground, walls, [
    point(1, 'player_start', 9, 10),
    point(2, 'senoj', 11, 3, { npc: 'senoj', dialogue: 'archive_greeting' }),
    // Interactive objects: "sprite" is a manifest key, "action" is what happens when used,
    // "label" is the hint shown when Sivart is close.
    point(3, 'living_record', 9, 4, { sprite: 'living-record', action: 'level_select', label: 'Open the Living Record' }),
  ]);
}
