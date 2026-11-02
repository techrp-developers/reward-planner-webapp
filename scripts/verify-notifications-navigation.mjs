// scripts/verify-notifications-navigation.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function verifyNotificationNavigation() {
  console.log('Launching Chrome to verify notification navigation fixes...');
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

  // 1. Open Notifications Full Page
  console.log('Navigating to /employee-login/notifications...');
  await page.goto('http://localhost:5173/employee-login/notifications', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const shot1 = path.join(ARTIFACT_DIR, 'notification_fix_1_full_page.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved:', shot1);

  // Check the notification cards rendered
  const cards = page.locator('[data-notification-card]');
  const count = await cards.count();
  console.log('Notification cards found on page:', count);

  // Find a Chat notification (e.g. Arpita Bhilare or any chat card)
  const chatCard = page.locator('[data-notification-card]:has-text("Arpita Bhilare")').first();
  const hasChatCard = await chatCard.count() > 0;
  console.log('Found Arpita Bhilare chat notification card:', hasChatCard);

  if (hasChatCard) {
    const actionBtn = chatCard.locator('a, button').first();
    const actionText = await actionBtn.textContent();
    const href = await actionBtn.getAttribute('href');
    console.log(`Chat notification action button text: "${actionText?.trim()}", href: "${href}"`);

    // Click the action button
    console.log('Clicking action button to open chat...');
    await actionBtn.click();
    await page.waitForTimeout(3000);

    const shot2 = path.join(ARTIFACT_DIR, 'notification_fix_2_chat_navigated.png');
    await page.screenshot({ path: shot2 });
    console.log('Saved:', shot2);
    console.log('Current URL after clicking chat notification action:', page.url());
  }

  // 2. Navigate back to Notifications Full Page
  console.log('Navigating back to /notifications...');
  await page.goto('http://localhost:5173/employee-login/notifications', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Find a Cart notification (e.g. Did you forget something? 🛒)
  const cartCard = page.locator('[data-notification-card]:has-text("Cart")').first();
  if (await cartCard.count() > 0) {
    const actionBtn = cartCard.locator('a, button').first();
    const actionText = await actionBtn.textContent();
    const href = await actionBtn.getAttribute('href');
    console.log(`Cart notification action button text: "${actionText?.trim()}", href: "${href}"`);

    console.log('Clicking Cart notification action...');
    await actionBtn.click();
    await page.waitForTimeout(2500);

    const shot3 = path.join(ARTIFACT_DIR, 'notification_fix_3_cart_navigated.png');
    await page.screenshot({ path: shot3 });
    console.log('Saved:', shot3);
    console.log('Current URL after clicking cart notification action:', page.url());
  }

  // 3. Test Drawer Panel Bell Trigger Navigation
  console.log('Navigating to Home / employee-login/');
  await page.goto('http://localhost:5173/employee-login/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const bellBtn = page.locator('button[title*="Notification"], button[aria-label*="Notification"]').first();
  if (await bellBtn.count() > 0) {
    console.log('Opening Notifications Panel drawer via bell icon...');
    await bellBtn.click();
    await page.waitForTimeout(1500);

    const shot4 = path.join(ARTIFACT_DIR, 'notification_fix_4_drawer_panel.png');
    await page.screenshot({ path: shot4 });
    console.log('Saved:', shot4);

    const drawerChatCard = page.locator('.MuiDrawer-root [data-notification-card]:has-text("Arpita Bhilare")').first();
    if (await drawerChatCard.count() > 0) {
      console.log('Clicking Arpita Bhilare card in drawer panel...');
      await drawerChatCard.click();
      await page.waitForTimeout(3000);

      const shot5 = path.join(ARTIFACT_DIR, 'notification_fix_5_drawer_chat_navigated.png');
      await page.screenshot({ path: shot5 });
      console.log('Saved:', shot5);
      console.log('Current URL after drawer card click:', page.url());
    }
  }

  await browser.close();
  console.log('All verification steps completed successfully!');
}

verifyNotificationNavigation().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
