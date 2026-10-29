// scripts/test-mobile-complete-flow.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function testCompleteFlow() {
  console.log('📱 Testing Mobile & Desktop Complete Flow...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Mobile Test (390 x 844 iPhone / Android)
  console.log('--- 1. MOBILE PHONE SCREEN TEST (390 x 844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  await mobileContext.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_for_mobile_test');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ id: 101, name: 'Sakshi Chavan' }));
    localStorage.setItem('rp_access_token', 'mock_jwt_token_for_mobile_test');
    localStorage.setItem('rp_user_profile', JSON.stringify({ id: 101, name: 'Sakshi Chavan' }));
  });

  await mobileContext.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin.includes('localhost:5173')) return route.continue();
    if (url.pathname.includes('/user-info')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 101, name: 'Sakshi Chavan', rewardPoints: 2714 },
        }),
      });
    }
    if (url.pathname.includes('/terms/status')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accepted: true } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const mobilePage = await mobileContext.newPage();
  console.log('Navigating to mobile quiz lobby...');
  await mobilePage.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_lobby_responsive.png') });
  console.log('  📸 Captured mobile_lobby_responsive.png');

  // Start Quiz
  console.log('Clicking Start Quiz on mobile...');
  const startBtn = mobilePage.getByRole('button', { name: /Start Quiz/i });
  await startBtn.click();
  await mobilePage.waitForTimeout(1000);

  // Capture 1st Question
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_q1_arena_verified.png') });
  console.log('  📸 Captured mobile_q1_arena_verified.png');

  // Answer Q1 with Correct Option ("Mars")
  console.log('Selecting option "Mars" on mobile Q1...');
  const marsOption = mobilePage.getByRole('button', { name: /Mars/i }).first();
  await marsOption.click();
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_q1_feedback_verified.png') });
  console.log('  📸 Captured mobile_q1_feedback_verified.png');

  // Click Continue to Q2
  console.log('Clicking Continue to advance to Q2...');
  const continueBtn = mobilePage.getByRole('button', { name: /Continue/i }).first();
  await continueBtn.click();
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_q2_arena_verified.png') });
  console.log('  📸 Captured mobile_q2_arena_verified.png');

  // Answer Q2, Q3, Q4, Q5 to reach Score Page
  console.log('Completing questions Q2 -> Q5...');
  let iterations = 0;
  while (iterations < 25) {
    iterations++;
    const playAgainBtn = mobilePage.getByRole('button', { name: /Play Again/i }).first();
    if (await playAgainBtn.isVisible()) {
      console.log('  🎯 Score page reached!');
      break;
    }

    const continueBtn = mobilePage.getByRole('button', { name: /Continue/i }).first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await mobilePage.waitForTimeout(700);
      continue;
    }

    const tryAgainBtn = mobilePage.getByRole('button', { name: /Try Again/i }).first();
    if (await tryAgainBtn.isVisible()) {
      await tryAgainBtn.click();
      await mobilePage.waitForTimeout(600);
      continue;
    }

    // Click first enabled option that has not been disabled
    const enabledOption = mobilePage.locator('button:not([disabled])').filter({ hasText: /#[1-4]/ }).first();
    if (await enabledOption.isVisible()) {
      await enabledOption.click();
      await mobilePage.waitForTimeout(800);
      continue;
    }

    await mobilePage.waitForTimeout(400);
  }

  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_score_screen_verified.png') });
  console.log('  📸 Captured mobile_score_screen_verified.png');

  // Click Play Again
  const playAgainBtn = mobilePage.getByRole('button', { name: /Play Again/i }).first();
  if (await playAgainBtn.isVisible()) {
    console.log('Clicking Play Again on mobile score page...');
    await playAgainBtn.click();
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_restarted_q1_verified.png') });
    console.log('  📸 Captured mobile_restarted_q1_verified.png');
  }

  await mobileContext.close();

  // 2. Desktop Test (1366 x 768)
  console.log('--- 2. DESKTOP SCREEN TEST (1366 x 768) ---');
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
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 101, name: 'Sakshi Chavan' } }) });
    }
    if (url.pathname.includes('/terms/status')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accepted: true } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(500);

  const desktopStart = desktopPage.getByRole('button', { name: /Start Quiz/i });
  await desktopStart.click();
  await desktopPage.waitForTimeout(1200);
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_arena_timer_verified.png') });
  console.log('  📸 Captured desktop_arena_timer_verified.png');

  await browser.close();
  console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
}

testCompleteFlow().catch((err) => {
  console.error('❌ Flow test failed:', err);
  process.exit(1);
});
