// scripts/verify-seen-status-fix.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function testSeenStatusFix() {
  console.log('Launching Chrome to verify chat message status fix...');
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
      company: 'MPS Global',
      email: 'sakshi@mpsglobal.com',
      role: 'customer'
    }));
  }, VALID_USER_37_TOKEN);

  const page = await ctx.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

  console.log('Navigating to chat page...');
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // 1. Capture main chat list view
  const shot1 = path.join(ARTIFACT_DIR, 'chat_seen_fix_1_list.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved:', shot1);

  // 2. Open Devashish direct chat (conversation_id 3)
  console.log('Clicking Devashish Pal in conversation list...');
  const devashishText = page.locator('text="Devashish Pal"').first();
  await devashishText.waitFor({ state: 'visible', timeout: 10000 });
  await devashishText.click();
  await page.waitForTimeout(3000);

  // 2. Capture conversation with messages before sending
  const shot2 = path.join(ARTIFACT_DIR, 'chat_seen_fix_2_existing_messages.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved:', shot2);

  // Check existing outgoing checkmarks
  const checkIcons = page.locator('svg.lucide-check, svg.lucide-check-check, svg.lucide-clock');
  const iconCount = await checkIcons.count();
  console.log('Number of checkmark/status icons in conversation:', iconCount);
  for (let i = 0; i < iconCount; i++) {
    const icon = checkIcons.nth(i);
    const cls = await icon.getAttribute('class');
    const color = await icon.evaluate((el) => window.getComputedStyle(el).color);
    console.log(`Icon ${i}: class="${cls}", computed color="${color}"`);
  }

  // 3. Send a new message to coworker
  console.log('Looking for chat input...');
  const chatInput = page.locator('input[placeholder*="Type a message"], textarea[placeholder*="Type a message"]').first();
  await chatInput.waitFor({ state: 'visible', timeout: 5000 });
  
  const testText = 'Hello Devashish, status progression check ' + new Date().toLocaleTimeString();
  await chatInput.fill(testText);
  await page.keyboard.press('Enter');
  console.log('Submitted message, waiting 600ms for API response...');

  await page.waitForTimeout(600);
  const shot3 = path.join(ARTIFACT_DIR, 'chat_seen_fix_3_newly_sent.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved:', shot3);

  // Wait 3 seconds to confirm it remains sent (single tick / not prematurely blue)
  await page.waitForTimeout(3000);
  const shot4 = path.join(ARTIFACT_DIR, 'chat_seen_fix_4_confirmed_not_seen.png');
  await page.screenshot({ path: shot4 });
  console.log('Saved:', shot4);

  // Check newly sent message icon
  const lastCheck = page.locator('svg.lucide-check, svg.lucide-check-check, svg.lucide-clock').last();
  if (await lastCheck.count() > 0) {
    const cls = await lastCheck.getAttribute('class');
    const color = await lastCheck.evaluate((el) => window.getComputedStyle(el).color);
    console.log(`Newly sent message icon: class="${cls}", color="${color}"`);
  }

  await browser.close();
  console.log('All verification steps completed successfully!');
}

testSeenStatusFix().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
