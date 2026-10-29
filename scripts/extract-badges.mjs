import sharp from 'sharp';

async function extractCircularBadge(srcPath, cx, cy, radius, outPath) {
  const size = radius * 2;
  const left = Math.round(cx - radius);
  const top = Math.round(cy - radius);
  
  const circleMask = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius - 0.5}" fill="white" />
    </svg>
  `);
  
  await sharp(srcPath)
    .extract({ left, top, width: size, height: size })
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toFile(outPath);
}

async function run() {
  await Promise.all([
    extractCircularBadge('scratch/cropped_strip_user.png', 59, 59, 36, 'src/assets/games/quiz/pillar_badge_1.png'),
    extractCircularBadge('scratch/cropped_strip_user.png', 301.5, 59, 36, 'src/assets/games/quiz/pillar_badge_2.png'),
    extractCircularBadge('scratch/cropped_strip_user.png', 552.5, 59, 36, 'src/assets/games/quiz/pillar_badge_3.png'),
    extractCircularBadge('scratch/cropped_strip_user.png', 776.5, 59, 36, 'src/assets/games/quiz/pillar_badge_4.png')
  ]);
  console.log('Extracted 4 circular badges successfully!');
}

run();
