const sharp = require('sharp');
const path = require('path');

const imgPath = 'C:/projects/RewardPlannersWebApp/reward-planner-webapp/src/assets/games/quiz/quiz_screen_question.jpg';

async function createSeamlessArena() {
  const svgOverlay = Buffer.from(`
    <svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <!-- Pill button interior fill -->
        <linearGradient id="pillFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#091A54" />
          <stop offset="100%" stop-color="#040D30" />
        </linearGradient>
      </defs>

      <!-- Fully opaque soft-blurred rect that completely covers the text -->
      <rect x="270" y="232" width="485" height="116" rx="22" fill="#020C38" filter="url(#softBlur)" />
      <rect x="282" y="240" width="460" height="100" rx="16" fill="#020C38" />

      <!-- Clean Option 1 (Top Left) -->
      <rect x="365" y="380" width="170" height="40" rx="20" fill="url(#pillFill)" />

      <!-- Clean Option 2 (Top Right) -->
      <rect x="592" y="380" width="170" height="40" rx="20" fill="url(#pillFill)" />

      <!-- Clean Option 3 (Bottom Left) -->
      <rect x="365" y="460" width="170" height="40" rx="20" fill="url(#pillFill)" />

      <!-- Clean Option 4 (Bottom Right) -->
      <rect x="592" y="460" width="170" height="40" rx="20" fill="url(#pillFill)" />
    </svg>
  `);

  const outPath = 'C:/projects/RewardPlannersWebApp/reward-planner-webapp/src/assets/games/quiz/quiz_screen_arena_clean.png';

  await sharp(imgPath)
    .composite([
      { input: svgOverlay, left: 0, top: 0, blend: 'over' }
    ])
    .toFile(outPath);

  console.log('Successfully updated quiz_screen_arena_clean.png');
}
createSeamlessArena();
