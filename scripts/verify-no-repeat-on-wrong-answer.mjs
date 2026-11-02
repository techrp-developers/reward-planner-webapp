import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function verifyNoRepeatOnWrongAnswer() {
  console.log('🧪 Verifying Quiz Game: Question does NOT repeat on wrong answer and moves to 2nd question...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_jwt_token_quiz_advance');
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
  await page.goto('http://localhost:5173/employee-login/games/quiz', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Click Start Quiz
  console.log('1. Starting Quiz...');
  await page.locator('button[aria-label="Start Quiz"]').click({ force: true });
  await page.waitForTimeout(800);

  // 2. Inspect Question 1 text
  const q1TextLocator = page.locator('h2:visible').first();
  const q1Text = await q1TextLocator.textContent();
  console.log('Question 1 Text:', q1Text?.trim());

  // 3. Deliberately pick wrong answer (e.g. Earth)
  console.log('2. Selecting wrong option on Question 1...');
  const wrongOpt1 = page.locator('button:visible', { hasText: 'Earth' }).first();
  await wrongOpt1.click({ force: true });
  await page.waitForTimeout(800);

  // Take screenshot of Question 1 incorrect state
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'q1_incorrect_no_try_again.png') });
  console.log('Saved q1_incorrect_no_try_again.png');

  // Verify "Try Again" is 0
  const tryAgainCount = await page.locator('button:has-text("Try Again")').count();
  console.log('"Try Again" button count (MUST BE 0):', tryAgainCount);
  if (tryAgainCount !== 0) {
    throw new Error('FAIL: "Try Again" button should not exist!');
  }

  // 4. Click Next Question
  console.log('3. Clicking Next Question...');
  const nextBtn1 = page.locator('button:visible:has-text("Next Question"), button:visible:has-text("Next")').first();
  await nextBtn1.click({ force: true });
  await page.waitForTimeout(800);

  // 5. Inspect Question 2 text
  const q2TextLocator = page.locator('h2:visible').first();
  const q2Text = await q2TextLocator.textContent();
  console.log('Question 2 Text:', q2Text?.trim());

  // Screenshot Question 2
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'q2_advanced_not_repeated.png') });
  console.log('Saved q2_advanced_not_repeated.png');

  // ASSERT: Question 2 is DIFFERENT from Question 1!
  if (q2Text?.trim() === q1Text?.trim()) {
    throw new Error(`FAIL: Question repeated! Both Q1 and Q2 are: "${q1Text?.trim()}"`);
  }
  console.log(`✅ SUCCESS: Question 2 did NOT repeat! Q1 was "${q1Text?.trim()}", Q2 is "${q2Text?.trim()}".`);

  // 6. Test wrong answer on Question 2 as well!
  console.log('4. Selecting wrong option on Question 2...');
  const wrongOpt2 = page.locator('button:visible', { hasText: 'Ampere' }).first();
  await wrongOpt2.click({ force: true });
  await page.waitForTimeout(800);

  const nextBtn2 = page.locator('button:visible:has-text("Next Question"), button:visible:has-text("Next")').first();
  await nextBtn2.click({ force: true });
  await page.waitForTimeout(800);

  // 7. Inspect Question 3 text
  const q3TextLocator = page.locator('h2:visible').first();
  const q3Text = await q3TextLocator.textContent();
  console.log('Question 3 Text:', q3Text?.trim());

  // Screenshot Question 3
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'q3_advanced_not_repeated.png') });
  console.log('Saved q3_advanced_not_repeated.png');

  if (q3Text?.trim() === q2Text?.trim() || q3Text?.trim() === q1Text?.trim()) {
    throw new Error(`FAIL: Question repeated on Q3! "${q3Text?.trim()}"`);
  }
  console.log(`✅ SUCCESS: Question 3 did NOT repeat! Q3 is "${q3Text?.trim()}".`);

  await browser.close();
  console.log('\n🎉 ALL CHECKS PASSED: When answer is wrong, the question never repeats and cleanly advances to the 2nd question!');
}

verifyNoRepeatOnWrongAnswer().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
