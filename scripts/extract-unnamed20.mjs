import fs from 'fs';
import path from 'path';

const svgPath = 'C:/projects/RewardPlannersWebApp/reward-planner-webapp/src/assets/games/quiz/unnamed 20.svg';
const outPath = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/extracted_unnamed20.png';

const svg = fs.readFileSync(svgPath, 'utf8');
const base64Prefix = 'data:image/png;base64,';
const startIdx = svg.indexOf(base64Prefix);
if (startIdx !== -1) {
  const dataStart = startIdx + base64Prefix.length;
  const endIdx = svg.indexOf('"', dataStart);
  const base64Data = svg.substring(dataStart, endIdx);
  const buf = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(outPath, buf);
  console.log('Successfully extracted PNG, size:', buf.length, 'bytes');
} else {
  console.log('No base64 image found');
}
