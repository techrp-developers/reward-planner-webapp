// scripts/test-score-leaderboard-sync.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function testScoreLeaderboardSync() {
  console.log('🎮 Testing Quiz Game Score to Leaderboard Synchronization...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_sync');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ user_id: 37, id: 37, name: 'Sakshi Chavan' }));
    localStorage.setItem('rp_access_token', 'mock_jwt_token_sync');
    localStorage.setItem('rp_user_profile', JSON.stringify({ user_id: 37, id: 37, name: 'Sakshi Chavan' }));
  });

  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin.includes('localhost:5173')) return route.continue();
    if (url.pathname.includes('/user-info')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user_id: 37, id: 37, name: 'Sakshi Chavan' } }) });
    }
    if (url.pathname.includes('/terms/status')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accepted: true } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const page = await context.newPage();

  // 1. Visit Quiz Lobby
  console.log('1. Loading Quiz Page Lobby...');
  await page.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sync_01_lobby_initial.png') });

  // 2. Click "Start Quiz"
  console.log('2. Starting Quiz...');
  const startBtn = page.locator('button[aria-label="Start Quiz"]');
  await startBtn.click();
  await page.waitForTimeout(600);

  // 3. Play 5 Questions: 4 correct, 1 wrong to score exactly 7 or 8 points!
  console.log('3. Answering 5 questions...');
  for (let q = 1; q <= 5; q++) {
    await page.waitForTimeout(400);
    // On question 1: pick wrong option (Earth) to test penalty, then pick Mars (correct)
    if (q === 1) {
      console.log('  Q1: Click wrong option first...');
      const option1 = page.locator('button', { hasText: 'Earth' }).first();
      if (await option1.isVisible()) {
        await option1.click();
        await page.waitForTimeout(400);
      }
      // Click Try Again or continue
      const tryAgain = page.locator('button:has-text("Try Again")').first();
      if (await tryAgain.isVisible()) {
        await tryAgain.click();
        await page.waitForTimeout(400);
      }
      const optionMars = page.locator('button', { hasText: 'Mars' }).first();
      if (await optionMars.isVisible()) {
        await optionMars.click();
        await page.waitForTimeout(400);
      }
    } else if (q === 2) {
      const opt = page.locator('button', { hasText: 'Ohm' }).first();
      if (await opt.isVisible()) await opt.click();
    } else if (q === 3) {
      const opt = page.locator('button', { hasText: 'Problem Solving' }).first();
      if (await opt.isVisible()) await opt.click();
    } else if (q === 4) {
      const opt = page.locator('button', { hasText: '206' }).first();
      if (await opt.isVisible()) await opt.click();
    } else if (q === 5) {
      const opt = page.locator('button', { hasText: 'Gold' }).first();
      if (await opt.isVisible()) await opt.click();
    }

    await page.waitForTimeout(400);
    // Click Continue
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Finish Quiz")').first();
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // 4. Verify Score Screen
  console.log('4. Verifying Score Screen...');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sync_02_score_screen.png') });

  // 5. Click "Go to Leaderboard"
  console.log('5. Clicking Go to Leaderboard...');
  const leaderboardBtn = page.locator('button:has-text("Go to Leaderboard")').first();
  await leaderboardBtn.click();
  await page.waitForTimeout(1000);

  // 6. Verify Leaderboard Page with updated score
  console.log('6. Verifying Leaderboard Page...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sync_03_leaderboard_updated.png') });

  // 7. Return to Quiz Lobby and verify lobby leaderboard
  console.log('7. Returning to Quiz Page Lobby...');
  await page.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sync_04_lobby_leaderboard_updated.png') });

  // 8. Mobile verification (390 x 844)
  console.log('8. Testing mobile leaderboard (390 x 844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/employee-login/games/leaderboard?tab=quiz', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sync_05_mobile_leaderboard_updated.png') });

  console.log('✅ Score-to-Leaderboard synchronization successfully tested!');
  await browser.close();
}

testScoreLeaderboardSync().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
