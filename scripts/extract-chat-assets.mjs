import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sourceImgPath = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79/.user_uploaded/media_1793095746589_f4c0e486.jpg';
const outputDir = path.resolve('src/assets/chat');

async function extractWallpaper() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });

  const base64 = fs.readFileSync(sourceImgPath).toString('base64');
  await page.setContent(`<img id="srcImg" src="data:image/jpeg;base64,${base64}" />`);
  await page.waitForSelector('#srcImg');

  const bgData = await page.evaluate(() => {
    const img = document.getElementById('srcImg');
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 240;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 740, 80, 240, 240, 0, 0, 240, 240);
    return c.toDataURL('image/png');
  });

  fs.writeFileSync(path.join(outputDir, 'whatsapp_bg_tile.png'), Buffer.from(bgData.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('Saved whatsapp_bg_tile.png');
  await browser.close();
}

extractWallpaper().catch(console.error);
