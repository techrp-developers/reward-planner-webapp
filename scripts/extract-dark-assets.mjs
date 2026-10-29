// scripts/extract-dark-assets.mjs
import sharp from 'sharp';
import path from 'path';

const img1 = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/.user_uploaded/media_1793100082733_7df6cc90.png';
const img2 = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/.user_uploaded/media_1793100102818_b3c99aa2.png';
const img3 = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/.user_uploaded/media_1793100122130_9d8836d1.png';

const outputDir = path.resolve('src/assets/chat');

async function extractAll() {
  // 1. RP Connect Avatar (img1, x ~ 65, y ~ 156, w: 38, h: 38)
  await sharp(img1)
    .extract({ left: 65, top: 156, width: 38, height: 38 })
    .toFile(path.join(outputDir, 'avatar_rp_connect.png'));

  // 2. DPU logo (img1, x ~ 65, y ~ 362, w: 38, h: 38)
  await sharp(img1)
    .extract({ left: 64, top: 360, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_dpu.png'));

  // 3. JioMart logo (img1, x ~ 65, y ~ 414, w: 38, h: 38)
  await sharp(img1)
    .extract({ left: 64, top: 412, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_jiomart.png'));

  // 4. Aaditi Bhosale (img2, x ~ 64, y ~ 446, w: 40, h: 40)
  await sharp(img2)
    .extract({ left: 64, top: 446, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_aaditi.png'));

  // 5. Aditya Chavan (img2, x ~ 64, y ~ 500, w: 40, h: 40)
  await sharp(img2)
    .extract({ left: 64, top: 500, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_aditya.png'));

  // 6. Monali (img3, x ~ 64, y ~ 194, w: 40, h: 40)
  await sharp(img3)
    .extract({ left: 64, top: 194, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_monali.png'));

  // 7. Ajay Mama (img3, x ~ 64, y ~ 248, w: 40, h: 40)
  await sharp(img3)
    .extract({ left: 64, top: 248, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_ajay.png'));

  // 8. Manish Sir (img3, x ~ 64, y ~ 302, w: 40, h: 40)
  await sharp(img3)
    .extract({ left: 64, top: 302, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_manish.png'));

  // 9. Tanishka (img3, x ~ 64, y ~ 436, w: 40, h: 40)
  await sharp(img3)
    .extract({ left: 64, top: 436, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_tanishka.png'));

  // 10. Xerox print (img2, x ~ 64, y ~ 370, w: 40, h: 40)
  await sharp(img2)
    .extract({ left: 64, top: 370, width: 40, height: 40 })
    .toFile(path.join(outputDir, 'avatar_xerox.png'));

  console.log('Refined crops finished successfully!');
}

extractAll().catch(console.error);
