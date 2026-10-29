// scripts/test-leaderboard-page.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function testLeaderboardPage() {
  console.log('🏆 Testing Dynamic Games Leaderboard Page...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop Test (1366 x 768)
  console.log('--- 1. DESKTOP LEADERBOARD TEST (1366 x 768) ---');
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
    if (url.pathname.includes('/v1/quiz/leaderboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            players: [
              { user_id: 101, name: 'Sakshi Chavan', score: 10, total_games: 5 },
              { user_id: 102, name: 'Prajesh kumar', score: 10, total_games: 4 },
              { user_id: 103, name: 'Burhan Partapurwala', score: 10, total_games: 3 },
              { user_id: 104, name: 'Pooja Suresh Harne', score: 10, total_games: 4 },
              { user_id: 105, name: 'Bhagyashree Appasaheb Rodage', score: 10, total_games: 3 },
              { user_id: 106, name: 'Shejal Vaman Kamble', score: 10, total_games: 2 },
              { user_id: 107, name: 'Vivek Pise', score: 10, total_games: 2 },
              { user_id: 108, name: 'Devashish Pal', score: 9, total_games: 6 },
              { user_id: 109, name: 'Sanket Sangale', score: 8, total_games: 4 },
              { user_id: 110, name: 'Sahil Mujawar', score: 7, total_games: 2 },
            ],
            rules: { questionCount: 5, secondsPerQuestion: 15, correctPoints: 2, wrongPenalty: 1, timeoutPenalty: 1 }
          }
        }),
      });
    }
    if (url.pathname.includes('/v1/sudoku/leaderboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          leaderboard: [
            { user_id: 201, username: 'Harshali Chavan', total_points: 125, total_games: 15, easy_completed: 8, medium_completed: 5, hard_completed: 2, expert_completed: 0 },
            { user_id: 202, username: 'Shrinivas Karur', total_points: 110, total_games: 12, easy_completed: 6, medium_completed: 4, hard_completed: 2, expert_completed: 0 },
            { user_id: 203, username: 'Sahil Mujawar', total_points: 95, total_games: 10, easy_completed: 5, medium_completed: 3, hard_completed: 2, expert_completed: 0 },
            { user_id: 204, username: 'Geeta', total_points: 80, total_games: 8, easy_completed: 4, medium_completed: 3, hard_completed: 1, expert_completed: 0 },
            { user_id: 205, username: 'Sandhya Jadhav', total_points: 65, total_games: 7, easy_completed: 4, medium_completed: 2, hard_completed: 1, expert_completed: 0 },
          ],
        }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const desktopPage = await desktopContext.newPage();
  console.log('Navigating to /employee-login/games/leaderboard (Quiz tab)...');
  await desktopPage.goto('http://localhost:5173/employee-login/games/leaderboard?tab=quiz', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'leaderboard_quiz_desktop.png') });
  console.log('  📸 Captured leaderboard_quiz_desktop.png');

  // Switch to Sudoku Tab
  console.log('Switching to Sudoku Tab on Desktop...');
  const sudokuTabBtn = desktopPage.getByRole('button', { name: /Sudoku Challenge/i });
  await sudokuTabBtn.click();
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'leaderboard_sudoku_desktop.png') });
  console.log('  📸 Captured leaderboard_sudoku_desktop.png');

  // Test Search Filter
  console.log('Testing search filter with query "Burhan"...');
  const quizTabBtn = desktopPage.getByRole('button', { name: /Quivio Quiz/i });
  await quizTabBtn.click();
  await desktopPage.waitForTimeout(400);
  const searchInput = desktopPage.getByPlaceholder('Search player...');
  await searchInput.fill('Burhan');
  await desktopPage.waitForTimeout(400);
  await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'leaderboard_search_filtered.png') });
  console.log('  📸 Captured leaderboard_search_filtered.png');

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
    if (url.pathname.includes('/v1/quiz/leaderboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            players: [
              { user_id: 101, name: 'Sakshi Chavan', score: 10, total_games: 5 },
              { user_id: 102, name: 'Prajesh kumar', score: 10, total_games: 4 },
              { user_id: 103, name: 'Burhan Partapurwala', score: 10, total_games: 3 },
              { user_id: 104, name: 'Pooja Suresh Harne', score: 10, total_games: 4 },
              { user_id: 105, name: 'Bhagyashree Appasaheb Rodage', score: 10, total_games: 3 },
            ],
            rules: { questionCount: 5, secondsPerQuestion: 15, correctPoints: 2, wrongPenalty: 1, timeoutPenalty: 1 }
          }
        }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  const mobilePage = await mobileContext.newPage();
  console.log('Navigating to mobile /games/leaderboard...');
  await mobilePage.goto('http://localhost:5173/employee-login/games/leaderboard', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(ARTIFACT_DIR, 'leaderboard_mobile_screen.png') });
  console.log('  📸 Captured leaderboard_mobile_screen.png');

  await browser.close();
  console.log('🎉 LEADERBOARD VERIFICATION COMPLETED SUCCESSFULLY!');
}

testLeaderboardPage().catch((err) => {
  console.error('❌ Leaderboard test failed:', err);
  process.exit(1);
});
