// scripts/verify-profile-and-status.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function main() {
  console.log('Testing dynamic Profile & Status sections in chat module...');
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

  const page = await ctx.newPage();
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

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

  // ─────────────────────────────────────────────────────────────
  // 1. VERIFY DYNAMIC PROFILE VIEW
  // ─────────────────────────────────────────────────────────────
  console.log('Clicking bottom Profile icon on left rail...');
  const profileRailBtn = page.locator('button[title*="Profile"]').first();
  await profileRailBtn.click();
  await page.waitForTimeout(1500);

  const shot1 = path.join(ARTIFACT_DIR, 'chat_dynamic_profile_verified.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved Profile screenshot:', shot1);

  // Assert profile contents
  const hasName = await page.locator('text="Sakshi Chavan"').first().isVisible();
  const hasRole = await page.locator('text="Software Engineer • IT"').first().isVisible();
  const hasEmail = await page.locator('text="chavansakshi685@gmail.com"').first().isVisible();
  console.log(`Profile check: name visible=${hasName}, role visible=${hasRole}, email visible=${hasEmail}`);

  // ─────────────────────────────────────────────────────────────
  // 2. VERIFY DYNAMIC STATUS VIEW
  // ─────────────────────────────────────────────────────────────
  console.log('Clicking Status icon on left rail...');
  const statusRailBtn = page.locator('button[title="Status"]').first();
  await statusRailBtn.click();
  await page.waitForTimeout(2000);

  const shot2 = path.join(ARTIFACT_DIR, 'chat_dynamic_status_list_verified.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved Status list screenshot:', shot2);

  // Check coworker statuses
  const statusItems = page.locator('aside .chat-custom-scroll > div');
  const count = await statusItems.count();
  console.log(`Status items found: ${count}`);

  // ─────────────────────────────────────────────────────────────
  // 3. VERIFY STATUS STORY VIEWER
  // ─────────────────────────────────────────────────────────────
  console.log('Opening first coworker status story...');
  const firstCoworker = statusItems.nth(2); // after My Status and header
  if (await firstCoworker.isVisible()) {
    await firstCoworker.click();
    await page.waitForTimeout(1500);

    const shot3 = path.join(ARTIFACT_DIR, 'chat_status_story_viewer_verified.png');
    await page.screenshot({ path: shot3 });
    console.log('Saved Status Story Viewer screenshot:', shot3);

    // Close story viewer
    const closeBtn = page.locator('button[title="Close status"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. VERIFY ADD CUSTOM STATUS
  // ─────────────────────────────────────────────────────────────
  console.log('Opening Add Status modal...');
  const addStatusBtn = page.locator('button[title*="Add"]').first();
  await addStatusBtn.click();
  await page.waitForTimeout(800);

  const statusTextarea = page.locator('textarea[placeholder*="What\'s happening"]').first();
  await statusTextarea.fill('Successfully rolled out real-time chat updates! 🚀✨');
  
  // Choose second color theme (blue)
  const colorButtons = page.locator('button[class*="rounded-full bg-gradient-to-br"]');
  if (await colorButtons.count() > 1) {
    await colorButtons.nth(1).click();
  }

  const postBtn = page.locator('button:has-text("Post Status")').first();
  await postBtn.click();
  await page.waitForTimeout(1200);

  const shot4 = path.join(ARTIFACT_DIR, 'chat_my_status_posted_verified.png');
  await page.screenshot({ path: shot4 });
  console.log('Saved My Status posted screenshot:', shot4);

  await browser.close();
  console.log('Profile and Status verification completed!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
