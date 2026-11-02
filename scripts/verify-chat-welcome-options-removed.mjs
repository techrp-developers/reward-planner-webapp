import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function verifyChatWelcome() {
  console.log('🧪 Verifying Chat Welcome Screen (Add Contact & Ask Meta AI removed)...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_chat_check');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ user_id: 37, id: 37, name: 'Sakshi Chavan' }));
    localStorage.setItem('rp_sticky_notes', '[]');
  });

  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin.includes('localhost:5173')) return route.continue();
    if (url.pathname.includes('/user-info')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user_id: 37, id: 37, name: 'Sakshi Chavan' } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const page = await context.newPage();
  await page.goto('http://localhost:5173/employee-login/chat', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take screenshot of Chat Screen
  const screenshotPath = path.join(ARTIFACT_DIR, 'chat_screen_no_add_contact_meta_ai.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot:', screenshotPath);

  // Assertions
  const pageText = await page.textContent('body');
  const hasAddContact = pageText.includes('Add contact');
  const hasMetaAi = pageText.includes('Ask Meta AI') || pageText.includes('Meta AI');
  const hasSendDocument = pageText.includes('Send document');

  console.log('Checks:', {
    hasAddContact,       // Should be false
    hasMetaAi,           // Should be false
    hasSendDocument      // Should be true
  });

  if (hasAddContact) {
    throw new Error('FAIL: "Add contact" is still visible on screen!');
  }
  if (hasMetaAi) {
    throw new Error('FAIL: "Ask Meta AI" is still visible on screen!');
  }
  if (!hasSendDocument) {
    throw new Error('FAIL: "Send document" should be visible!');
  }

  console.log('✅ SUCCESS: "Add contact" and "Ask Meta AI" have been removed from the right-side section!');
  await browser.close();
}

verifyChatWelcome().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
