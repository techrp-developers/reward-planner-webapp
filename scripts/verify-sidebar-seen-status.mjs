// scripts/verify-sidebar-seen-status.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function main() {
  console.log('Testing outside chat section (sidebar) seen status...');
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
  // Open directly to the chat list (no active chat opened!)
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

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

  // Check the sidebar rows for Pradipta Rout and Devashish Pal
  const sidebarRows = page.locator('aside .chat-custom-scroll > div');
  const count = await sidebarRows.count();
  console.log(`Found ${count} sidebar conversation rows`);

  for (let i = 0; i < count; i++) {
    const row = sidebarRows.nth(i);
    const title = await row.locator('h3').textContent();
    const snippet = await row.locator('p').textContent();
    const icon = row.locator('svg.lucide-check, svg.lucide-check-check');
    const hasIcon = (await icon.count()) > 0;
    let iconClass = '';
    let iconColor = '';
    if (hasIcon) {
      iconClass = await icon.first().getAttribute('class');
      iconColor = await icon.first().evaluate((el) => window.getComputedStyle(el).color);
    }
    console.log(`Row ${i} [${title?.trim()}]: snippet="${snippet?.trim()}", hasIcon=${hasIcon}, class="${iconClass}", color="${iconColor}"`);
  }

  const outPath = path.join(ARTIFACT_DIR, 'whatsapp_sidebar_seen_status_verified.png');
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot:', outPath);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
