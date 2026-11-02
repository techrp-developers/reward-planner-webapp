import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

(async () => {
  console.log('Testing full dynamic Status flow in Chat module...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  await context.addInitScript((token) => {
    sessionStorage.setItem('rp_access_token', token);
    sessionStorage.setItem('rp_user_profile', JSON.stringify({
      id: 37,
      userId: 37,
      name: 'Sakshi Chavan',
      email: 'chavansakshi685@gmail.com',
      phone: '9370499816',
      userImage: 'https://cdn.rewardplanners.com/public/customers/37/profile-1791802604240-zbp5el.png?v=1793335442000',
      company_id: 1,
      company: { name: 'MPS Global' },
      employeeInfo: { role: 'Software Engineer', department: 'IT' },
      thought: 'Growth begins outside your comfort zone.',
      rewardPoints: 2714,
      role: 'customer'
    }));
  }, TOKEN);

  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Hide sticky note overlay if present
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

  // 1. Switch to Status tab
  console.log('Clicking Status Tab on navigation rail...');
  const statusRailBtn = page.locator('button[title="Status"]').first();
  await statusRailBtn.click();
  await page.waitForTimeout(2000);

  // Capture screenshot: Clean status list with no dummy status!
  const shot1 = path.join(ARTIFACT_DIR, 'chat_dynamic_status_list_verified.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved Screenshot 1 (Status List):', shot1);

  // 2. Click "My status" to open Story Viewer
  console.log('Clicking My status row to view active story...');
  const myStatusRow = page.locator('text=My status').first();
  await myStatusRow.click();
  await page.waitForTimeout(1500);

  const shot2 = path.join(ARTIFACT_DIR, 'chat_status_story_viewer_verified.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved Screenshot 2 (Story Viewer):', shot2);

  // Close story viewer
  const closeBtn = page.locator('button[title="Close status"]');
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(800);
  }

  // 3. Click "Text status" on the welcome screen to test modal trigger
  console.log('Clicking "Text status" button on right welcome panel...');
  const textStatusBtn = page.locator('button:has-text("Text status")');
  if (await textStatusBtn.count() > 0) {
    await textStatusBtn.first().click();
    await page.waitForTimeout(1200);

    const shot3 = path.join(ARTIFACT_DIR, 'chat_add_status_modal_from_welcome_verified.png');
    await page.screenshot({ path: shot3 });
    console.log('Saved Screenshot 3 (Add Status Modal):', shot3);

    // Type a new status update and post it
    console.log('Typing a new real status update...');
    const textarea = page.locator('textarea[placeholder*="happening at work"]');
    if (await textarea.count() > 0) {
      await textarea.fill('Proud of our engineering team delivery today! 🚀');
      await page.waitForTimeout(600);

      // Select purple theme (index 2)
      const themeBtns = page.locator('button.w-7.h-7.rounded-full');
      if (await themeBtns.count() > 2) {
        await themeBtns.nth(2).click();
        await page.waitForTimeout(400);
      }

      console.log('Clicking "Post Status"...');
      const postBtn = page.locator('button:has-text("Post Status")');
      await postBtn.click();
      await page.waitForTimeout(3000);

      const shot4 = path.join(ARTIFACT_DIR, 'chat_my_status_posted_verified.png');
      await page.screenshot({ path: shot4 });
      console.log('Saved Screenshot 4 (After posting new status):', shot4);
    }
  }

  await browser.close();
  console.log('All status flow tests completed successfully!');
})();
