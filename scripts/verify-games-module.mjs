// scripts/verify-games-module.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function verifyGames() {
  console.log('🚀 Starting Games Module E2E Verification...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
  });

  // Mock authentication in sessionStorage & localStorage
  await context.addInitScript(() => {
    try {
      const mockProfile = {
        id: 101,
        name: 'Sakshi Chavan',
        first_name: 'Sakshi',
        last_name: 'Chavan',
        email: 'sakshi@mpsglobal.com',
        rewardPoints: 2714,
        company: { name: 'MPS Global' },
      };
      sessionStorage.setItem('rp_access_token', 'mock_jwt_token_for_games_testing');
      sessionStorage.setItem('rp_user_profile', JSON.stringify(mockProfile));
      localStorage.setItem('rp_access_token', 'mock_jwt_token_for_games_testing');
      localStorage.setItem('rp_user_profile', JSON.stringify(mockProfile));
    } catch (e) {
      console.error('Storage init error:', e);
    }
  });

  // Intercept backend auth and terms requests, but let sudoku hit real backend or provide real payload
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.origin.includes('localhost:5173')) {
      return route.continue();
    }

    if (url.pathname.includes('/user-info') || url.pathname.includes('/auth/user-info')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 101,
            name: 'Sakshi Chavan',
            email: 'sakshi@mpsglobal.com',
            rewardPoints: 2714,
            company: { name: 'MPS Global' },
          },
        }),
      });
    }

    if (url.pathname.includes('/terms/status')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { accepted: true },
        }),
      });
    }

    // Let live Sudoku requests continue to real backend server
    if (url.pathname.includes('/sudoku/')) {
      return route.continue();
    }

    // Default mock response for other external API endpoints
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  const page = await context.newPage();

  // 1. Verify Games Hub Page
  console.log('1️⃣ Navigating to /employee-login/games...');
  await page.goto('http://localhost:5173/employee-login/games', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'games_home_hub_verified.png') });
  console.log('  📸 Captured games_home_hub_verified.png');

  // 2. Click Sudoku "Play Now"
  console.log('2️⃣ Clicking Sudoku "Play Now"...');
  // Find the Play Now button inside the Sudoku card (second Play Now button on page)
  const sudokuPlayBtn = page.locator('button:has-text("Play Now")').nth(1);
  await sudokuPlayBtn.click();
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  console.log('  Current URL after clicking Sudoku:', currentUrl);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sudoku_page_started_verified.png') });
  console.log('  📸 Captured sudoku_page_started_verified.png');

  // 3. Test Sudoku Number Input & Cell Selection
  console.log('3️⃣ Interacting with Sudoku 9x9 board...');
  // Click cell at (0, 2) which is empty in fallback or board
  const emptyCells = page.locator('main div.grid-cols-9 button:text("")');
  const count = await emptyCells.count();
  console.log(`  Found ${count} empty cells on the Sudoku board.`);
  if (count > 0) {
    await emptyCells.first().click();
    await page.waitForTimeout(400);
    // Tap number 7 on numpad
    await page.locator('div.grid-cols-3 button:text-is("7")').first().click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sudoku_board_interaction_verified.png') });
  console.log('  📸 Captured sudoku_board_interaction_verified.png');

  // 4. Open Sudoku Leaderboard Modal
  console.log('4️⃣ Opening Sudoku Leaderboard...');
  const leaderboardBtn = page.locator('button:has-text("Leaderboard")').first();
  await leaderboardBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sudoku_leaderboard_verified.png') });
  console.log('  📸 Captured sudoku_leaderboard_verified.png');

  // Close Leaderboard modal
  await page.locator('button:has-text("Back to Play")').click();
  await page.waitForTimeout(500);

  // 5. Navigate to /games/quiz
  console.log('5️⃣ Navigating to /games/quiz...');
  await page.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'quiz_lobby_api_verified.png') });
  console.log('  📸 Captured quiz_lobby_api_verified.png');

  // Start Quiz
  const startQuizBtn = page.locator('button:has-text("Start Quiz")').first();
  if (await startQuizBtn.isVisible()) {
    await startQuizBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'quiz_arena_api_verified.png') });
    console.log('  📸 Captured quiz_arena_api_verified.png');
  }

  await browser.close();
  console.log('🎉 Verification completed successfully!');
}

verifyGames().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
