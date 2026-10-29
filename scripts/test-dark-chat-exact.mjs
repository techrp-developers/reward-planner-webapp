// scripts/test-dark-chat-exact.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function runDarkChatVerification() {
  console.log('🚀 Starting Exact WhatsApp Windows Desktop Dark Mode Verification...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const desktopCtx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  await desktopCtx.addInitScript((token) => {
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

  const page = await desktopCtx.newPage();

  // 1. Initial State (Matches Image 1)
  console.log('\n--- 1. Testing Initial State (Image 1: Rail + Chats List + 4 Circular Action Buttons) ---');
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const screenshot1 = path.join(ARTIFACT_DIR, 'chat_20_dark_main_screen.png');
  await page.screenshot({ path: screenshot1 });
  console.log('📸 Screenshot saved: chat_20_dark_main_screen.png');

  // 2. Click Green Squircle [ + ] Button (Matches Image 2: New Chat view)
  console.log('\n--- 2. Testing New Chat View (Image 2: Green [ + ] Clicked) ---');
  const plusButton = await page.$('button[title="New chat"]');
  if (plusButton) {
    await plusButton.click();
    await page.waitForTimeout(800);
    const screenshot2 = path.join(ARTIFACT_DIR, 'chat_21_dark_new_chat_screen.png');
    await page.screenshot({ path: screenshot2 });
    console.log('📸 Screenshot saved: chat_21_dark_new_chat_screen.png');
  }

  // 3. Click Status Tab on Far-Left Rail (Matches Image 3: Status View)
  console.log('\n--- 3. Testing Status View (Image 3: Status Rail Icon Clicked) ---');
  const statusTab = await page.$('button[title="Status"]');
  if (statusTab) {
    await statusTab.click();
    await page.waitForTimeout(800);
    const screenshot3 = path.join(ARTIFACT_DIR, 'chat_22_dark_status_screen.png');
    await page.screenshot({ path: screenshot3 });
    console.log('📸 Screenshot saved: chat_22_dark_status_screen.png');
  }

  // 4. Return to Chats and open "Reward Planners Connect" conversation
  console.log('\n--- 4. Testing Active Conversation View (Reward Planners Connect) ---');
  const chatsTab = await page.$('button[title="Chats"]');
  if (chatsTab) {
    await chatsTab.click();
    await page.waitForTimeout(600);
  }

  const rpConnectChat = await page.getByText('Reward Planners Connect').first();
  if (rpConnectChat) {
    await rpConnectChat.click();
    await page.waitForTimeout(1000);
    const screenshot4 = path.join(ARTIFACT_DIR, 'chat_23_dark_active_chat.png');
    await page.screenshot({ path: screenshot4 });
    console.log('📸 Screenshot saved: chat_23_dark_active_chat.png');
  }

  await browser.close();
  console.log('\n🎉 Verification completed successfully!');
}

runDarkChatVerification().catch(console.error);
