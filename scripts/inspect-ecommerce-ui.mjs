import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function main() {
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

  console.log('Visiting /store...');
  await page.goto('http://localhost:5173/employee-login/store', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, 'before_store_overview.png') });

  // Scroll to categories and tab grid
  const categoriesSection = page.locator('text=Categories').first();
  if (await categoriesSection.count() > 0) {
    await categoriesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'before_store_categories.png') });
  }

  console.log('Visiting /store?view=all...');
  await page.goto('http://localhost:5173/employee-login/store?view=all', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, 'before_store_all_products.png') });

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
