import sharp from 'sharp';

function getMedalSvg(type) {
  const configs = {
    gold: {
      ribbonDark: '#CA8A04',
      ribbonLight: '#EAB308',
      circleOuter: '#FACC15',
      circleStroke: '#CA8A04',
      circleInner: '#EAB308',
      star: '#0F172A',
    },
    silver: {
      ribbonDark: '#64748B',
      ribbonLight: '#94A3B8',
      circleOuter: '#E2E8F0',
      circleStroke: '#94A3B8',
      circleInner: '#CBD5E1',
      star: '#0F172A',
    },
    bronze: {
      ribbonDark: '#C2410C',
      ribbonLight: '#EA580C',
      circleOuter: '#FB923C',
      circleStroke: '#C2410C',
      circleInner: '#EA580C',
      star: '#0F172A',
    },
  };
  const c = configs[type];
  return `
    <svg width="40" height="48" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 1L10 7L16 1L14 11L10 8L6 11L4 1Z" fill="${c.ribbonDark}" />
      <path d="M5 1L10 6L15 1L13.5 9L10 7L6.5 9L5 1Z" fill="${c.ribbonLight}" />
      <circle cx="10" cy="15" r="7" fill="${c.circleOuter}" stroke="${c.circleStroke}" stroke-width="0.8" />
      <circle cx="10" cy="15" r="5.2" fill="${c.circleInner}" />
      <path d="M10 11.5L11.2 14.1L14 14.3L11.8 16L12.5 18.7L10 17.2L7.5 18.7L8.2 16L6 14.3L8.8 14.1L10 11.5Z" fill="${c.star}" />
    </svg>
  `;
}

async function render() {
  const artifactDir = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';
  await sharp(Buffer.from(getMedalSvg('gold'))).toFile(artifactDir + '/svg_medal_gold.png');
  await sharp(Buffer.from(getMedalSvg('silver'))).toFile(artifactDir + '/svg_medal_silver.png');
  await sharp(Buffer.from(getMedalSvg('bronze'))).toFile(artifactDir + '/svg_medal_bronze.png');
  console.log('Saved SVG medals');
}

render().catch(console.error);
