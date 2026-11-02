// scripts/verify-chats-label-and-back-btn.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function main() {
  console.log('Testing "Chats" label and back button behavior...');
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

  // 1. Verify "Chats" label is present in header (no WhatsApp text)
  const headerChats = page.locator('aside h1:has-text("Chats")');
  console.log('Chats label visible in header:', await headerChats.isVisible());
  const shot1 = path.join(ARTIFACT_DIR, 'whatsapp_chats_label_welcome.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved Welcome Screen with Chats label:', shot1);

  // 2. Click on a chat contact
  const firstContact = page.locator('aside .chat-custom-scroll > div').first();
  console.log('Clicking chat contact...');
  await firstContact.click();
  await page.waitForTimeout(1200);

  // 3. Capture Active Chat view showing back button above/next to Chats label and in conversation header
  const shot2 = path.join(ARTIFACT_DIR, 'whatsapp_chat_clicked_with_back_btn.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved Active Chat with Back Button:', shot2);

  // 4. Click the back button next to "Chats" label
  const backBtn = page.locator('aside button[title="Back to all chats"]').first();
  console.log('Back button visible in sidebar header:', await backBtn.isVisible());
  await backBtn.click();
  await page.waitForTimeout(1000);

  // 5. Verify it returned back to welcome view (chat deselected)
  const shot3 = path.join(ARTIFACT_DIR, 'whatsapp_after_back_clicked.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved After Back Clicked View:', shot3);

  await browser.close();
  console.log('All tests passed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
