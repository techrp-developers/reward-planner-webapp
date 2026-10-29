import sharp from 'sharp';

async function buildCleanCanvases() {
  // 1. RIGHT CARD
  const rightOrig = 'src/assets/games/quiz/rightsidecard.png';
  const rightMeta = await sharp(rightOrig).metadata();

  const rightSvg = Buffer.from(`
    <svg width="${rightMeta.width}" height="${rightMeta.height}">
      <defs>
        <linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#013faa" />
          <stop offset="25%" stop-color="#002b85" />
          <stop offset="50%" stop-color="#001d66" />
          <stop offset="75%" stop-color="#001655" />
          <stop offset="92%" stop-color="#011778" />
          <stop offset="100%" stop-color="#011886" />
        </linearGradient>
        <linearGradient id="rFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="92%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>
        <mask id="rMask">
          <rect x="36" y="20" width="715" height="116" rx="14" fill="url(#rFade)" />
        </mask>
      </defs>
      <rect x="36" y="20" width="715" height="116" rx="14" fill="url(#rGrad)" mask="url(#rMask)" />
    </svg>
  `);

  await sharp(rightOrig)
    .composite([{ input: rightSvg, top: 0, left: 0 }])
    .toFile('src/assets/games/quiz/rightsidecard_clean_canvas.png');

  // 2. LEFT CARD
  const leftOrig = 'src/assets/games/quiz/infocard.png';
  const leftMeta = await sharp(leftOrig).metadata();

  const leftSvg = Buffer.from(`
    <svg width="${leftMeta.width}" height="${leftMeta.height}">
      <defs>
        <linearGradient id="lGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#020229" />
          <stop offset="25%" stop-color="#040434" />
          <stop offset="50%" stop-color="#05053e" />
          <stop offset="75%" stop-color="#07084a" />
          <stop offset="90%" stop-color="#0a0756" />
          <stop offset="100%" stop-color="#0f0760" />
        </linearGradient>
        <linearGradient id="lFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="85%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>
        <mask id="lMask">
          <rect x="40" y="36" width="530" height="175" rx="18" fill="url(#lFade)" />
        </mask>
      </defs>
      <rect x="40" y="36" width="530" height="175" rx="18" fill="url(#lGrad)" mask="url(#lMask)" />
    </svg>
  `);

  await sharp(leftOrig)
    .composite([{ input: leftSvg, top: 0, left: 0 }])
    .toFile('src/assets/games/quiz/infocard_clean_canvas.png');

  console.log('Successfully updated clean canvases with full height coverage');
}

buildCleanCanvases().catch(console.error);
