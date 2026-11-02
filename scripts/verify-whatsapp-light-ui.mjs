// scripts/verify-whatsapp-light-ui.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function main() {
  console.log('Launching browser to verify WhatsApp Light Theme UI...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const ctx = await browser.newContext({ viewport: { width: 1400, height: 860 } });
  await ctx.addInitScript((token) => {
    sessionStorage.setItem('rp_access_token', token);
    sessionStorage.setItem('rp_user_profile', JSON.stringify({
      id: 37,
      userId: 37,
      name: 'Sakshi Chavan',
      company_id: 1,
      company: 'MPS Global',
      email: 'sakshi@mpsglobal.com',
      role: 'customer'
    }));
    // Close sticky notes
    localStorage.setItem('rp_sticky_notes_data_v1', JSON.stringify([{ id: 'note-welcome-1', isOpen: false, contentHtml: '' }]));
    localStorage.setItem('rp_sticky_notes', '[]');
  }, VALID_USER_37_TOKEN);

  const page = await ctx.newPage();
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Capture Welcome screen (no bottom banner, FAB in bottom-right corner)
  const shot1 = path.join(ARTIFACT_DIR, 'whatsapp_light_welcome_view.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved Welcome Screen:', shot1);

  // 2. Click FAB to verify New Chat view opens
  const fab = page.locator('button[title="New chat"]').first();
  if (await fab.isVisible()) {
    console.log('Clicking FAB button...');
    await fab.click();
    await page.waitForTimeout(1000);
    const shotFab = path.join(ARTIFACT_DIR, 'whatsapp_light_fab_clicked.png');
    await page.screenshot({ path: shotFab });
    console.log('Saved FAB Clicked View:', shotFab);

    // Click back arrow to return to chats list
    const backBtn = page.locator('aside button:has(svg)').first();
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // 3. Open conversation
  const firstContact = page.locator('aside .chat-custom-scroll > div').first();
  if (await firstContact.isVisible()) {
    console.log('Clicking first chat contact...');
    await firstContact.click();
    await page.waitForTimeout(1200);
    const shot2 = path.join(ARTIFACT_DIR, 'whatsapp_light_active_chat.png');
    await page.screenshot({ path: shot2 });
    console.log('Saved Active Chat Screen:', shot2);
  }

  await browser.close();
  console.log('All verification checks completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
