import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function run() {
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

  // 1. Visit /services
  console.log('Navigating to /employee-login/services...');
  await page.goto('http://localhost:5173/employee-login/services', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactDir, 'inspect_services_page.png') });

  // 2. Visit a service detail page
  console.log('Navigating to /employee-login/services/detail/1...');
  await page.goto('http://localhost:5173/employee-login/services/detail/1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactDir, 'inspect_service_detail.png') });

  // 3. Visit /services/category/1
  console.log('Navigating to /employee-login/services/category/1...');
  await page.goto('http://localhost:5173/employee-login/services/category/1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactDir, 'inspect_service_category.png') });

  await browser.close();
  console.log('Inspection screenshots saved.');
}

run();
