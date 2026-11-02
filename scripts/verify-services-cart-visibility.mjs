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

  // Test 1: On Homepage (Home module) -> Cart icon should NOT be visible
  console.log('Testing 1: Home page (should NOT show services cart icon)...');
  await page.goto('http://localhost:5173/employee-login/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const homeCart = page.locator('header a[href*="services/cart"]');
  const homeCartVisible = await homeCart.count() > 0 && await homeCart.isVisible();
  console.log('Home module shows services cart icon:', homeCartVisible);

  await page.screenshot({ path: path.join(artifactDir, 'cart_check_1_home_no_cart.png') });

  // Test 2: On Store (Products module) -> Cart icon should NOT be visible
  console.log('Testing 2: Store page (should NOT show services cart icon)...');
  await page.goto('http://localhost:5173/employee-login/store', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const storeCart = page.locator('header a[href*="services/cart"]');
  const storeCartVisible = await storeCart.count() > 0 && await storeCart.isVisible();
  console.log('Store module shows services cart icon:', storeCartVisible);

  await page.screenshot({ path: path.join(artifactDir, 'cart_check_2_store_no_cart.png') });

  // Test 3: On Services (/services) -> Cart icon MUST be visible
  console.log('Testing 3: Services page (MUST show services cart icon)...');
  await page.goto('http://localhost:5173/employee-login/services', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const servicesCart = page.locator('header a[href*="services/cart"]');
  const servicesCartVisible = await servicesCart.count() > 0 && await servicesCart.isVisible();
  console.log('Services module shows services cart icon:', servicesCartVisible);

  await page.screenshot({ path: path.join(artifactDir, 'cart_check_3_services_shows_cart.png') });

  // Test 4: On Services Category (/services/category/1) -> Cart icon MUST be visible
  console.log('Testing 4: Services Category page (MUST show services cart icon)...');
  await page.goto('http://localhost:5173/employee-login/services/category/1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const categoryCart = page.locator('header a[href*="services/cart"]');
  const categoryCartVisible = await categoryCart.count() > 0 && await categoryCart.isVisible();
  console.log('Services Category shows services cart icon:', categoryCartVisible);

  await page.screenshot({ path: path.join(artifactDir, 'cart_check_4_category_shows_cart.png') });

  console.log('All tests completed successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
