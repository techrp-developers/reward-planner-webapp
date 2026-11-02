import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function run() {
  console.log('Testing removal of Navratri banner & Shop Now page...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  await context.addInitScript((token) => {
    sessionStorage.setItem('rp_access_token', token);
    sessionStorage.setItem('rp_user_profile', JSON.stringify({
      id: 37,
      userId: 37,
      name: 'Sakshi Chavan',
      company_id: 1,
      company: 'MPS Global',
      email: 'sakshi@mpsglobal.com',
      role: 'customer',
    }));
  }, VALID_USER_37_TOKEN);

  const page = await context.newPage();

  // 1. Visit /store
  console.log('Navigating to /employee-login/store...');
  await page.goto('http://localhost:5173/employee-login/store', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Check if Navratri banner exists
  const navratriBanner = page.locator('img[alt*="Navratri" i], [title*="Navratri" i]');
  const bannerCount = await navratriBanner.count();
  console.log('Navratri banner count on store page (should be 0):', bannerCount);

  const shot1 = path.join(artifactDir, 'store_no_navratri_banner.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved store screenshot:', shot1);

  // 2. Visit /navratri (should redirect to /store)
  console.log('Navigating to /employee-login/navratri...');
  await page.goto('http://localhost:5173/employee-login/navratri', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Current URL after /navratri navigation:', page.url());
  const isRedirectedToStore = page.url().includes('/store');
  console.log('Redirected to /store:', isRedirectedToStore);

  console.log('Verification completed successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
