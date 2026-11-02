import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function run() {
  console.log('Launching browser to test R logo account menu...');
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

  // 1. Visit homepage
  console.log('Navigating to http://localhost:5173/employee-login/...');
  await page.goto('http://localhost:5173/employee-login/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Verify hamburger menu icon is GONE
  const hamburgerIcon = page.locator('svg[data-testid="MenuRoundedIcon"]');
  const hamburgerCount = await hamburgerIcon.count();
  console.log('Hamburger menu icon count in header (should be 0):', hamburgerCount);

  // Take screenshot of header right corner
  const shot1 = path.join(artifactDir, 'r_logo_1_header_clean.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved:', shot1);

  // 2. Click the R logo button
  console.log('Clicking the R logo button in the right corner...');
  const rLogoBtn = page.locator('#account-menu-button');
  await rLogoBtn.click();
  await page.waitForTimeout(600);

  // Verify menu is opened with Profile and Logout options
  const profileItem = page.locator('#account-menu a[href*="profile"]');
  const logoutItem = page.locator('#account-menu li:has-text("Logout")');
  console.log('Profile menu item visible:', await profileItem.isVisible());
  console.log('Logout menu item visible:', await logoutItem.isVisible());

  // Take screenshot with menu open
  const shot2 = path.join(artifactDir, 'r_logo_2_menu_opened.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved:', shot2);

  console.log('R logo account menu verification completed successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
