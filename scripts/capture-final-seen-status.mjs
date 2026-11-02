// scripts/capture-final-seen-status.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function main() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((token) => {
    sessionStorage.setItem('rp_access_token', token);
    sessionStorage.setItem('rp_user_profile', JSON.stringify({
      id: 37,
      userId: 37,
      name: 'Sakshi Chavan',
      company_id: 1,
      role: 'customer'
    }));
  }, TOKEN);

  const page = await ctx.newPage();
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click Pradipta Rout (conv 29)
  const pradipta = page.locator('text="Pradipta Rout"').first();
  await pradipta.click();
  await page.waitForTimeout(2500);

  // Close or hide any sticky note overlay
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      if (el.textContent && el.textContent.includes('Welcome to Sticky Notes')) {
        let p = el;
        while (p && p !== document.body) {
          if (
            window.getComputedStyle(p).position === 'fixed' ||
            window.getComputedStyle(p).position === 'absolute'
          ) {
            p.style.display = 'none';
            break;
          }
          p = p.parentElement;
        }
      }
    });
  });

  const outPath = path.join(ARTIFACT_DIR, 'whatsapp_pradipta_seen_status_verified.png');
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot:', outPath);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
