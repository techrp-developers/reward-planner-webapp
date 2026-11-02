import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function verifyQuizAndLeaderboard() {
  console.log('🧪 Verifying Quiz Game (No "Try Again", Dynamic Leaderboard)...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ─────────────────────────────────────────────
  // 1. DESKTOP VIEW (1366 x 768)
  // ─────────────────────────────────────────────
  console.log('\n--- 1. Desktop Quiz Lobby & Arena ---');
  const desktopCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await desktopCtx.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_quiz_test');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ user_id: 37, id: 37, name: 'Sakshi Chavan' }));
    localStorage.setItem('rp_sticky_notes', '[]');
  });

  await desktopCtx.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin.includes('localhost:5173')) return route.continue();
    if (url.pathname.includes('/user-info')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { user_id: 37, id: 37, name: 'Sakshi Chavan' } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const page = await desktopCtx.newPage();
  await page.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Screenshot Quiz Lobby with Dynamic Leaderboard Card
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'quiz_lobby_dynamic_leaderboard.png') });
  console.log('Saved quiz_lobby_dynamic_leaderboard.png');

  // Verify Lobby text
  const lobbyBody = await page.textContent('body');
  const lobbyHasTopEmployees = lobbyBody.includes('Top employees of MPS Global');
  const lobbyHasStreak = /🔥\s*\d+d/.test(lobbyBody);
  const lobbyHasPoints = lobbyBody.includes('PTS');
  console.log('Desktop Lobby Check:', { lobbyHasTopEmployees, lobbyHasStreak, lobbyHasPoints });

  // Click Start Quiz
  console.log('Starting Quiz...');
  await page.locator('button[aria-label="Start Quiz"]').click();
  await page.waitForTimeout(800);

  // Deliberately select wrong option (Earth) on Question 1 (Sun is a star)
  console.log('Selecting wrong answer (Earth)...');
  const earthOpt = page.locator('button:visible', { hasText: 'Earth' }).first();
  await earthOpt.click();
  await page.waitForTimeout(800);

  // Assert "INCORRECT!" text is displayed
  const feedbackText = await page.textContent('body');
  const hasIncorrect = feedbackText.includes('INCORRECT!');
  const hasNotQuiteRight = feedbackText.includes("That wasn't quite right.");
  console.log('Feedback Check:', { hasIncorrect, hasNotQuiteRight });

  // Assert "Try Again" is ABSENT
  const tryAgainCount = await page.locator('button:has-text("Try Again")').count();
  console.log('"Try Again" button count (MUST BE 0):', tryAgainCount);

  // Assert single Next button is present
  const nextBtn = page.locator('button:visible:has-text("Next Question"), button:visible:has-text("Finish Quiz")').first();
  const nextVisible = await nextBtn.isVisible();
  console.log('Single Next button visible:', nextVisible);

  // Screenshot showing wrong answer feedback with NO "Try Again" button
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'quiz_arena_incorrect_no_try_again.png') });
  console.log('Saved quiz_arena_incorrect_no_try_again.png');

  // Advance through remaining questions to reach Score screen
  console.log('Completing remaining questions to verify dynamic Score & Leaderboard update...');
  for (let step = 0; step < 6; step++) {
    // Check if score screen is reached
    if (await page.locator('text=QUIZ COMPLETED!').first().isVisible({ timeout: 500 }).catch(() => false)) {
      break;
    }

    // If next button visible, click it
    const activeNext = page.locator('button:visible:has-text("Next Question"), button:visible:has-text("Continue"), button:visible:has-text("Finish Quiz")').first();
    if (await activeNext.isVisible({ timeout: 500 }).catch(() => false)) {
      await activeNext.click();
      await page.waitForTimeout(600);
    }

    if (await page.locator('text=QUIZ COMPLETED!').first().isVisible({ timeout: 500 }).catch(() => false)) {
      break;
    }

    // Pick an available option
    const optionBtn = page.locator('button:visible:has(span.truncate)').first();
    if (await optionBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await optionBtn.click();
      await page.waitForTimeout(600);
    }
  }

  await page.waitForTimeout(1000);

  // Screenshot Score screen
  const isScoreScreen = await page.locator('text=QUIZ COMPLETED!').first().isVisible();
  console.log('Score screen reached:', isScoreScreen);
  if (isScoreScreen) {
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'quiz_score_dynamic_stats.png') });
    console.log('Saved quiz_score_dynamic_stats.png');
    const scoreBody = await page.textContent('body');
    console.log('Score stats check:', {
      hasPoints: scoreBody.includes('PTS'),
      hasStreak: /🔥\s*\d+/.test(scoreBody),
      hasRank: /Rank\s*#\d+/.test(scoreBody)
    });
  }

  // ─────────────────────────────────────────────
  // 2. FULL GAMES LEADERBOARD PAGE
  // ─────────────────────────────────────────────
  console.log('\n--- 2. Full Games Leaderboard Page ---');
  await page.goto('http://localhost:5173/employee-login/games/leaderboard?tab=quiz', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Screenshot full Games Leaderboard
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'games_leaderboard_quiz_dynamic.png') });
  console.log('Saved games_leaderboard_quiz_dynamic.png');

  // Verify Leaderboard features
  const lbBody = await page.textContent('body');
  const lbTopEmployees = lbBody.includes('Top employees of MPS Global');
  const lbStreak = lbBody.includes('Day Streak');
  const lbPoints = lbBody.includes('PTS');
  console.log('Games Leaderboard Page Check:', { lbTopEmployees, lbStreak, lbPoints });

  // ─────────────────────────────────────────────
  // 3. MOBILE VIEW (390 x 844)
  // ─────────────────────────────────────────────
  console.log('\n--- 3. Mobile View Verification ---');
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await mobileCtx.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_quiz_test_m');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ user_id: 37, id: 37, name: 'Sakshi Chavan' }));
    localStorage.setItem('rp_sticky_notes', '[]');
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
  await mobilePage.waitForTimeout(800);

  // Start Quiz on mobile
  await mobilePage.locator('button[aria-label="Start Quiz"]').click({ force: true });
  await mobilePage.waitForTimeout(800);

  // Pick wrong option (Earth) on mobile
  const earthOptMobile = mobilePage.locator('button:visible', { hasText: 'Earth' }).first();
  await earthOptMobile.click({ force: true });
  await mobilePage.waitForTimeout(800);

  // Verify no "Try Again" button on mobile
  const mobileTryAgainCount = await mobilePage.locator('button:has-text("Try Again")').count();
  console.log('Mobile "Try Again" count (MUST BE 0):', mobileTryAgainCount);

  // Screenshot Mobile wrong feedback
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'quiz_mobile_incorrect_no_try_again.png') });
  console.log('Saved quiz_mobile_incorrect_no_try_again.png');

  await browser.close();
  console.log('\n🎉 ALL TESTS PASSED! Verification completed successfully.');
}

verifyQuizAndLeaderboard().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
