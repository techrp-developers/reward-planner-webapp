// scripts/capture-final-chat.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function capture() {
  console.log('Capturing screenshots with new dummy data in chat and new chat...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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
  }, VALID_USER_37_TOKEN);

  const page = await ctx.newPage();
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 1. Main chat view with new dummy chats
  const shot1 = path.join(ARTIFACT_DIR, 'chat_diff_data_main.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved:', shot1);

  // 2. Click green [ + ] button to open New Chat view
  const plusBtn = page.locator('button[title="New chat"]');
  if (await plusBtn.isVisible()) {
    await plusBtn.click();
    await page.waitForTimeout(800);
    const shot2 = path.join(ARTIFACT_DIR, 'chat_diff_data_new_chat.png');
    await page.screenshot({ path: shot2 });
    console.log('Saved:', shot2);

    // Click back to return to chats list
    const backFromNew = page.locator('aside button:has(svg)').first();
    await backFromNew.click();
    await page.waitForTimeout(500);
  }

  // 3. Open Engineering & Tech Squad active chat
  const engChat = page.getByText('Engineering & Tech Squad').first();
  if (await engChat.isVisible()) {
    await engChat.click();
    await page.waitForTimeout(1000);
    const shot3 = path.join(ARTIFACT_DIR, 'chat_diff_data_active.png');
    await page.screenshot({ path: shot3 });
    console.log('Saved:', shot3);
  }

  await browser.close();
  console.log('Done!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
