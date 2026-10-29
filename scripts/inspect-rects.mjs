import { chromium } from 'playwright-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.addInitScript(() => {
    sessionStorage.setItem('token', 'mock-valid-token');
    sessionStorage.setItem('user', JSON.stringify({
      id: 101,
      name: 'Sakshi Chavan',
      role: 'EMPLOYEE',
    }));
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/employee-login/games/quiz');
  await page.waitForTimeout(1000);
  const rects = await page.evaluate(() => {
    const allCards = document.querySelectorAll('.rounded-\\[24px\\], .rounded-\\[28px\\]');
    const card = allCards[0]?.getBoundingClientRect();
    const mascot = document.querySelector('img[alt="Quivio Scholar Mascot"]')?.getBoundingClientRect();
    const cards3 = document.querySelectorAll('.grid.grid-cols-3 > div');
    const card3 = cards3[2]?.getBoundingClientRect();
    return { card, mascot, card3 };
  });
  console.log(JSON.stringify(rects, null, 2));
  await browser.close();
}
run();
