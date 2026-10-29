import sharp from 'sharp';
import path from 'path';

async function generateCleanCanvases() {
  // 1. Right Card
  const rightOrig = 'src/assets/games/quiz/rightsidecard.png';
  const rightMeta = await sharp(rightOrig).metadata();

  const rightSvg = `
    <svg width="${rightMeta.width}" height="${rightMeta.height}">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0047b3" />
          <stop offset="15%" stop-color="#003594" />
          <stop offset="50%" stop-color="#002170" />
          <stop offset="85%" stop-color="#01154f" />
          <stop offset="100%" stop-color="#01154f" />
        </linearGradient>
        <linearGradient id="fadeMask" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="92%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>
        <mask id="mask">
          <rect x="42" y="26" width="675" height="108" rx="10" fill="url(#fadeMask)" />
        </mask>
      </defs>
      <rect x="42" y="26" width="675" height="108" rx="10" fill="url(#headerGrad)" mask="url(#mask)" />
    </svg>
  `;

  await sharp(rightOrig)
    .composite([{ input: Buffer.from(rightSvg), top: 0, left: 0 }])
    .toFile('src/assets/games/quiz/rightsidecard_clean_canvas.png');
  console.log('Saved rightsidecard_clean_canvas.png');

  // 2. Left Card
  const leftOrig = 'src/assets/games/quiz/infocard.png';
  const leftMeta = await sharp(leftOrig).metadata();

  const leftSvg = `
    <svg width="${leftMeta.width}" height="${leftMeta.height}">
      <defs>
        <radialGradient id="leftGrad" cx="15%" cy="15%" r="70%">
          <stop offset="0%" stop-color="#1b063d" />
          <stop offset="35%" stop-color="#14042e" />
          <stop offset="70%" stop-color="#0b021b" />
          <stop offset="100%" stop-color="#070114" />
        </radialGradient>
        <linearGradient id="leftFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="88%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>
        <mask id="leftMask">
          <rect x="42" y="38" width="500" height="185" rx="18" fill="url(#leftFade)" />
        </mask>
      </defs>
      <rect x="42" y="38" width="500" height="185" rx="18" fill="url(#leftGrad)" mask="url(#leftMask)" />
    </svg>
  `;

  await sharp(leftOrig)
    .composite([{ input: Buffer.from(leftSvg), top: 0, left: 0 }])
    .toFile('src/assets/games/quiz/infocard_clean_canvas.png');
  console.log('Saved infocard_clean_canvas.png');
}

generateCleanCanvases().catch(console.error);
