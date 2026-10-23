// Makes the placeholder art and the test map for Milestone 1.
//
// Run with:  npm run make-placeholders
//
// You normally never need to run this again. It exists so the placeholder files can be
// rebuilt if they get lost. Once real art arrives (Milestone 6) and maps are drawn in
// Tiled, this script can be deleted.
//
// It writes:
//   maps/tilesets/placeholder.png        4 tiles: grass, path, stone wall, water
//   assets/sprites/player-placeholder.png  Sivart, 4 frames: down, left, right, up
//   assets/sprites/senoj-placeholder.png   Mr. Senoj, 1 frame
//   maps/test-map.tmj                    a small Tiled map using the tileset above

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

// ---------- Tileset: grass, path, wall, water (each 16x16) ----------

const T = 16;
const tiles = new Canvas(T * 4, T);

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

// ---------- Test map (Tiled JSON) ----------

const W = 30;
const H = 20;
const GRASS = 1, PATH = 2, WALL = 3, WATER = 4; // Tiled "gid" numbers = tile index + 1
const ground = new Array(W * H).fill(GRASS);
const walls = new Array(W * H).fill(0); // 0 = empty
const at = (x, y) => y * W + x;

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

const tileLayer = (id, name, data) => ({
  id, name, type: 'tilelayer', width: W, height: H, data,
  x: 0, y: 0, opacity: 1, visible: true,
});

const point = (id, name, tileX, tileY, properties = []) => ({
  id, name, type: '', point: true,
  x: tileX * T + T / 2, y: tileY * T + T / 2, width: 0, height: 0,
  rotation: 0, visible: true, properties,
});

const map = {
  type: 'map',
  version: '1.10',
  tiledversion: '1.11.0',
  orientation: 'orthogonal',
  renderorder: 'right-down',
  infinite: false,
  width: W,
  height: H,
  tilewidth: T,
  tileheight: T,
  compressionlevel: -1,
  nextlayerid: 4,
  nextobjectid: 3,
  // Tilesets are embedded in the map (Phaser can't read separate .tsx files).
  // The tileset "name" must match a key in assets/manifest.json.
  tilesets: [{
    firstgid: 1,
    name: 'placeholder',
    image: 'tilesets/placeholder.png',
    imagewidth: T * 4,
    imageheight: T,
    tilewidth: T,
    tileheight: T,
    tilecount: 4,
    columns: 4,
    margin: 0,
    spacing: 0,
    // Any tile with collides = true is solid. Edit this in Tiled's tileset panel.
    tiles: [
      { id: 2, properties: [{ name: 'collides', type: 'bool', value: true }] },
      { id: 3, properties: [{ name: 'collides', type: 'bool', value: true }] },
    ],
  }],
  layers: [
    tileLayer(1, 'Ground', ground),
    tileLayer(2, 'Walls', walls),
    {
      id: 3, name: 'Objects', type: 'objectgroup', draworder: 'topdown',
      x: 0, y: 0, opacity: 1, visible: true,
      objects: [
        point(1, 'player_start', 3, 4),
        point(2, 'senoj', 11, 7, [
          { name: 'npc', type: 'string', value: 'senoj' },
          { name: 'dialogue', type: 'string', value: 'test' },
        ]),
      ],
    },
  ],
};

fs.writeFileSync('maps/test-map.tmj', JSON.stringify(map, null, 1));
console.log('wrote maps/test-map.tmj');
