const sharp = require('sharp');
const path = require('path');

const srcWrong = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/.user_uploaded/media_1792741652192_5cb8ed7e.jpg';
const srcCorrect = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/.user_uploaded/media_1792741651960_260b1639.jpg';
const outDir = 'C:/projects/RewardPlannersWebApp/reward-planner-webapp/src/assets/games/quiz';

async function extract() {
  await sharp(srcWrong)
    .extract({ left: 80, top: 435, width: 270, height: 285 })
    .toFile(path.join(outDir, 'mascot_wrong_patch.png'));

  await sharp(srcCorrect)
    .extract({ left: 80, top: 435, width: 270, height: 285 })
    .toFile(path.join(outDir, 'mascot_correct_patch.png'));

  console.log('Mascot patches extracted');
}
extract();
