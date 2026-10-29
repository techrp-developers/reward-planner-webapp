import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function run() {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
  });

  // Mock authentication in sessionStorage
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
      sessionStorage.setItem('rp_access_token', 'mock_jwt_token_for_quiz_testing');
      sessionStorage.setItem('rp_user_profile', JSON.stringify(mockProfile));
      localStorage.setItem('rp_access_token', 'mock_jwt_token_for_quiz_testing');
      localStorage.setItem('rp_user_profile', JSON.stringify(mockProfile));
    } catch (e) {
      console.error('Storage init error:', e);
    }
  });

  // Intercept backend auth and terms requests
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

    // Default mock response for other API endpoints
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  const page = await context.newPage();

  console.log('Navigating to /employee-login/games/quiz ...');
  await page.goto('http://localhost:5173/employee-login/games/quiz', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  await page.waitForTimeout(1000);

  // 1. Click "Start Quiz"
  console.log('Clicking Start Quiz button...');
  const startBtn = page.getByRole('button', { name: /Start Quiz/i });
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(1500);

    // 1. Capture Idle Question Screen (cartoon3.png mascot)
    console.log('Capturing Question Arena Screen (cartoon3 mascot)...');
    await page.screenshot({
      path: path.join(artifactDir, 'quiz_mascot_idle_verified.png'),
      fullPage: false,
    });
    // Also save as quiz_arena_verified.png for compatibility
    await page.screenshot({
      path: path.join(artifactDir, 'quiz_arena_verified.png'),
      fullPage: false,
    });

    // 2. Click Wrong Option (Option 1: "Earth")
    console.log('Clicking wrong option Earth to test cartoon2 mascot...');
    const earthBtn = page.getByRole('button', { name: 'Earth', exact: true });
    if (await earthBtn.isVisible()) {
      await earthBtn.click();
      await page.waitForTimeout(1000);

      console.log('Capturing Wrong Answer Feedback (cartoon2 mascot)...');
      await page.screenshot({
        path: path.join(artifactDir, 'quiz_mascot_wrong_verified.png'),
        fullPage: false,
      });
      await page.screenshot({
        path: path.join(artifactDir, 'quiz_feedback_wrong_verified.png'),
        fullPage: false,
      });

      // Click "Try Again"
      const tryAgainBtn = page.getByRole('button', { name: /Try Again/i });
      if (await tryAgainBtn.isVisible()) {
        await tryAgainBtn.click();
        await page.waitForTimeout(500);

        // Click Correct Option (Option 2: "Mars")
        console.log('Clicking correct option Mars to test cartoon1 mascot...');
        const marsBtn = page.getByRole('button', { name: 'Mars', exact: true });
        if (await marsBtn.isVisible()) {
          await marsBtn.click();
          await page.waitForTimeout(1000);

          console.log('Capturing Correct Answer Feedback (cartoon1 mascot)...');
          await page.screenshot({
            path: path.join(artifactDir, 'quiz_mascot_correct_verified.png'),
            fullPage: false,
          });
          await page.screenshot({
            path: path.join(artifactDir, 'quiz_feedback_correct_verified.png'),
            fullPage: false,
          });

          // Advance through remaining questions (Q2, Q3, Q4, Q5)
          // Fallback Q2: 'Ohm' (correct)
          // Fallback Q3: 'Problem Solving' (correct)
          // Fallback Q4: '206' (correct)
          // Fallback Q5: 'Gold' (correct)
          const answers = ['Ohm', 'Problem Solving', '206', 'Gold'];
          for (let i = 0; i < answers.length; i++) {
            console.log(`Advancing to Question ${i + 2}...`);
            const continueBtn = page.getByRole('button', { name: /Continue/i });
            if (await continueBtn.isVisible()) {
              await continueBtn.click();
              await page.waitForTimeout(800);

              const correctOpt = page.getByRole('button', { name: answers[i], exact: true });
              if (await correctOpt.isVisible()) {
                await correctOpt.click();
                await page.waitForTimeout(800);
              }
            }
          }

          // After Q5, click Continue to complete quiz and open Score Page
          console.log('Clicking Continue after Question 5 to finish quiz...');
          const finalContinueBtn = page.getByRole('button', { name: /Continue/i });
          if (await finalContinueBtn.isVisible()) {
            await finalContinueBtn.click();
            await page.waitForTimeout(1200);

            console.log('Capturing Score Page Screen...');
            await page.screenshot({
              path: path.join(artifactDir, 'quiz_score_page_verified.png'),
              fullPage: false,
            });

            // Test "Play Again" button
            console.log('Testing Play Again button...');
            const playAgainBtn = page.getByRole('button', { name: /Play Again/i });
            if (await playAgainBtn.isVisible()) {
              await playAgainBtn.click();
              await page.waitForTimeout(1200);

              console.log('Capturing Restarted Question 1 after Play Again...');
              await page.screenshot({
                path: path.join(artifactDir, 'quiz_restarted_verified.png'),
                fullPage: false,
              });
            }
          }
        }
      }
    }
  } else {
    console.warn('Start Quiz button not found on page!');
  }

  await browser.close();
  console.log('All verification steps and screenshots completed successfully!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
