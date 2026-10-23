import { defineConfig } from 'vite';
import fs from 'node:fs';

// The game reads content/, maps/, and assets/ at runtime (with fetch), so they are not
// bundled into the JavaScript. During `npm run dev` Vite serves them straight from the
// project folder. During `npm run build` this little plugin copies them into dist/ so the
// finished site works on GitHub Pages.
const GAME_DATA_FOLDERS = ['content', 'maps', 'assets'];

function copyGameData() {
  return {
    name: 'copy-game-data',
    apply: 'build',
    closeBundle() {
      for (const folder of GAME_DATA_FOLDERS) {
        fs.cpSync(folder, `dist/${folder}`, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  // Relative paths so the built site works from any GitHub Pages sub-folder.
  base: './',
  plugins: [copyGameData()],
  // Phaser by itself is about 1.2 MB (320 KB zipped); that's expected, so don't warn about it.
  build: { chunkSizeWarningLimit: 1500 },
});
