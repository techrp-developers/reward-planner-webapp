import sharp from 'sharp';
import path from 'path';

const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function testFeathered() {
  const orig = 'src/assets/games/quiz/rightsidecard.png';
  const meta = await sharp(orig).metadata();

  const svgPatch = `
    <svg width="${meta.width}" height="${meta.height}">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0047b3" />
          <stop offset="20%" stop-color="#003390" />
          <stop offset="60%" stop-color="#00206e" />
          <stop offset="88%" stop-color="#01154f" />
          <stop offset="100%" stop-color="#01154f" />
        </linearGradient>
        <linearGradient id="fadeMask" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="85%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>
        <mask id="mask">
          <rect x="42" y="26" width="640" height="108" rx="10" fill="url(#fadeMask)" />
        </mask>
      </defs>
      <rect x="42" y="26" width="640" height="108" rx="10" fill="url(#headerGrad)" mask="url(#mask)" />
    </svg>
  `;

  await sharp(orig)
    .composite([{ input: Buffer.from(svgPatch), top: 0, left: 0 }])
    .toFile(path.join(artifactDir, 'seamless_test.png'));

  console.log('Saved seamless_test.png');
}

testFeathered().catch(console.error);
