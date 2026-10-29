import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../src/assets/games/quiz');

async function createCleanArenaBgs() {
  const patchSvg = Buffer.from(`
    <svg width="600" height="390" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#020d3b" stop-opacity="0.99" />
          <stop offset="70%" stop-color="#010a30" stop-opacity="0.99" />
          <stop offset="100%" stop-color="#000724" stop-opacity="0.99" />
        </radialGradient>
      </defs>
      <rect width="600" height="390" rx="20" fill="url(#grad)" />
    </svg>
  `);

  for (const state of ['neutral', 'sad', 'happy']) {
    const inputPath = path.join(outDir, `arena_bg_${state}.jpg`);
    const outputPath = path.join(outDir, `arena_clean_${state}.jpg`);
    
    await sharp(inputPath)
      .composite([{ input: patchSvg, left: 320, top: 220 }])
      .toFile(outputPath);
  }

  console.log('Clean arena backgrounds generated successfully!');
}

createCleanArenaBgs();
