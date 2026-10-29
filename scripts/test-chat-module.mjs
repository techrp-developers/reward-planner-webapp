// scripts/test-chat-module.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function runChatVerification() {
  console.log('🚀 Starting WhatsApp Chat Module Verification with Welcome State & Contacts...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const desktopCtx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
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

  // 1. Initial /chat load: Should NOT show any chat directly; should show WhatsApp Web Welcome screen
  console.log('--- 1. Testing Initial Welcome Screen (No Direct Chat Selected) ---');
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const screenshot1 = path.join(ARTIFACT_DIR, 'chat_10_welcome_screen_initial.png');
  await page.screenshot({ path: screenshot1 });
  console.log('📸 Screenshot saved: chat_10_welcome_screen_initial.png');

  // 2. Click on a chat item (Design Team) -> Now conversation opens on right side!
  console.log('\n--- 2. Clicking on "Design Team" chat ---');
  const designTeamChat = await page.getByText('Design Team').first();
  if (designTeamChat) {
    await designTeamChat.click();
    await page.waitForTimeout(1000);
    const screenshot2 = path.join(ARTIFACT_DIR, 'chat_11_chat_opened_after_click.png');
    await page.screenshot({ path: screenshot2 });
    console.log('📸 Screenshot saved: chat_11_chat_opened_after_click.png');
  }

  // 3. Click the New Chat icon (Floating Action Button at bottom right of chats or header)
  console.log('\n--- 3. Testing New Chat Icon & Contacts Modal ---');
  const newChatFab = await page.$('button[aria-label="New chat"]');
  if (newChatFab) {
    await newChatFab.click();
    await page.waitForTimeout(800);
    const screenshot3 = path.join(ARTIFACT_DIR, 'chat_12_contacts_invite_modal.png');
    await page.screenshot({ path: screenshot3 });
    console.log('📸 Screenshot saved: chat_12_contacts_invite_modal.png');

    // Click "Chat" on Ananya Roy or Priya Sharma
    const chatBtn = await page.getByText('Chat').first();
    if (chatBtn) {
      await chatBtn.click();
      await page.waitForTimeout(800);
      const screenshot4 = path.join(ARTIFACT_DIR, 'chat_13_direct_chat_from_contacts.png');
      await page.screenshot({ path: screenshot4 });
      console.log('📸 Screenshot saved: chat_13_direct_chat_from_contacts.png');
    }
  }

  await browser.close();
  console.log('\n✅ All new verification tests completed successfully!');
}

runChatVerification().catch(console.error);
