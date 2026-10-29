// scripts/test-wrong-answer-next-btn.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function testWrongAnswerNextButton() {
  console.log('🧪 Testing Next Button on Wrong Answer (Desktop & Mobile)...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // ─────────────────────────────────────────────
  // 1. DESKTOP TEST (1366 x 768)
  // ─────────────────────────────────────────────
  console.log('--- 1. Desktop Test ---');
  const desktopCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await desktopCtx.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_wrong_next');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ user_id: 37, id: 37, name: 'Sakshi Chavan' }));
  });

  await desktopCtx.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin.includes('localhost:5173')) return route.continue();
    if (url.pathname.includes('/user-info')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user_id: 37, id: 37, name: 'Sakshi Chavan' } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(600);

  // Click Start Quiz
  await desktopPage.locator('button[aria-label="Start Quiz"]').click();
  await desktopPage.waitForTimeout(600);

  // Pick wrong option (Earth)
  console.log('Selecting wrong answer (Earth) on desktop...');
  const earthOptDesktop = desktopPage.locator('button', { hasText: 'Earth' }).first();
  await earthOptDesktop.click();
  await desktopPage.waitForTimeout(600);

  // Screenshot showing BOTH "Try Again" and "Next" buttons on Desktop
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'wrong_answer_desktop_buttons.png') });
  console.log('Saved wrong_answer_desktop_buttons.png');

  // Click Next button
  console.log('Clicking Next button on desktop...');
  const nextBtnDesktop = desktopPage.locator('button:has-text("Next"), button:has-text("Finish Quiz")').first();
  await nextBtnDesktop.click();
  await desktopPage.waitForTimeout(600);

  // Screenshot showing Question 2
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'wrong_answer_desktop_next_advanced.png') });
  console.log('Saved wrong_answer_desktop_next_advanced.png');

  // ─────────────────────────────────────────────
  // 2. MOBILE TEST (390 x 844)
  // ─────────────────────────────────────────────
  console.log('--- 2. Mobile Test ---');
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await mobileCtx.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_wrong_next_m');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ user_id: 37, id: 37, name: 'Sakshi Chavan' }));
  });

  await mobileCtx.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin.includes('localhost:5173')) return route.continue();
    if (url.pathname.includes('/user-info')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user_id: 37, id: 37, name: 'Sakshi Chavan' } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);

  // Click Start Quiz
  await mobilePage.locator('button[aria-label="Start Quiz"]').click();
  await mobilePage.waitForTimeout(600);

  // Pick wrong option (Earth)
  console.log('Selecting wrong answer (Earth) on mobile...');
  const earthOptMobile = mobilePage.locator('button:visible', { hasText: 'Earth' }).first();
  await earthOptMobile.click();
  await mobilePage.waitForTimeout(600);

  // Screenshot showing BOTH "Try Again" and "Next" buttons on Mobile
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'wrong_answer_mobile_buttons.png') });
  console.log('Saved wrong_answer_mobile_buttons.png');

  // Click Next button
  console.log('Clicking Next button on mobile...');
  const nextBtnMobile = mobilePage.locator('button:visible:has-text("Next"), button:visible:has-text("Finish Quiz")').first();
  await nextBtnMobile.click();
  await mobilePage.waitForTimeout(600);

  // Screenshot showing Question 2
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'wrong_answer_mobile_next_advanced.png') });
  console.log('Saved wrong_answer_mobile_next_advanced.png');

  console.log('✅ Next button on wrong answer successfully verified!');
  await browser.close();
}

testWrongAnswerNextButton().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
