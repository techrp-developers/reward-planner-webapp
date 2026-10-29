// scripts/test-exit-btn.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function testExitButton() {
  console.log('🚪 Testing Exit Button on Desktop and Mobile Question Pages...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop Test (1366 x 768)
  console.log('--- 1. DESKTOP EXIT BUTTON TEST (1366 x 768) ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await desktopContext.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_desktop');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ id: 101, name: 'Sakshi Chavan' }));
    localStorage.setItem('rp_access_token', 'mock_jwt_token_desktop');
    localStorage.setItem('rp_user_profile', JSON.stringify({ id: 101, name: 'Sakshi Chavan' }));
  });

  await desktopContext.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin.includes('localhost:5173')) return route.continue();
    if (url.pathname.includes('/user-info')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 101, name: 'Sakshi Chavan', rewardPoints: 2714 } }) });
    }
    if (url.pathname.includes('/terms/status')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accepted: true } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(600);

  // Click Start Quiz
  const startBtn = desktopPage.getByRole('button', { name: /Start Quiz/i });
  await startBtn.click();
  await desktopPage.waitForTimeout(1000);

  // Capture Desktop Question 1 with Exit Button visible
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_q_page_exit_btn.png') });
  console.log('  📸 Captured desktop_q_page_exit_btn.png');

  // Click Floating Exit Button
  const exitBtn = desktopPage.getByRole('button', { name: /Exit Quiz/i }).first();
  await exitBtn.click();
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_exit_modal.png') });
  console.log('  📸 Captured desktop_exit_modal.png');

  // Click "Keep Playing"
  const keepPlayingBtn = desktopPage.getByRole('button', { name: /Keep Playing/i });
  await keepPlayingBtn.click();
  await desktopPage.waitForTimeout(600);

  // Click Exit again and confirm
  await exitBtn.click();
  await desktopPage.waitForTimeout(400);
  const confirmExitBtn = desktopPage.getByRole('button', { name: /Yes, Exit Quiz/i });
  await confirmExitBtn.click();
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_exited_to_lobby.png') });
  console.log('  📸 Captured desktop_exited_to_lobby.png');

  await desktopContext.close();

  // 2. Mobile Test (390 x 844)
  console.log('--- 2. MOBILE PHONE SCREEN TEST (390 x 844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  await mobileContext.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_mobile');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ id: 101, name: 'Sakshi Chavan' }));
    localStorage.setItem('rp_access_token', 'mock_jwt_token_mobile');
    localStorage.setItem('rp_user_profile', JSON.stringify({ id: 101, name: 'Sakshi Chavan' }));
  });

  await mobileContext.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin.includes('localhost:5173')) return route.continue();
    if (url.pathname.includes('/user-info')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 101, name: 'Sakshi Chavan', rewardPoints: 2714 } }) });
    }
    if (url.pathname.includes('/terms/status')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accepted: true } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);

  const mobileStartBtn = mobilePage.getByRole('button', { name: /Start Quiz/i });
  await mobileStartBtn.click();
  await mobilePage.waitForTimeout(1000);

  // Capture Mobile Question Page with Exit Button
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_q_page_exit_btn.png') });
  console.log('  📸 Captured mobile_q_page_exit_btn.png');

  // Click Mobile Exit Button
  const mobileExitBtn = mobilePage.getByRole('button', { name: /Exit/i }).first();
  await mobileExitBtn.click();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_exit_modal.png') });
  console.log('  📸 Captured mobile_exit_modal.png');

  // Confirm Mobile Exit
  const mobileConfirmBtn = mobilePage.getByRole('button', { name: /Yes, Exit Quiz/i });
  await mobileConfirmBtn.click();
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_exited_to_lobby.png') });
  console.log('  📸 Captured mobile_exited_to_lobby.png');

  await browser.close();
  console.log('🎉 ALL EXIT BUTTON TESTS COMPLETED SUCCESSFULLY!');
}

testExitButton().catch((err) => {
  console.error('❌ Exit button test failed:', err);
  process.exit(1);
});
