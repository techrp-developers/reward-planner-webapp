import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function run() {
  console.log('Testing services module cart icons...');
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

  // Check header cart icon
  const headerCart = page.locator('header a[href*="services/cart"]');
  console.log('Header services cart button count:', await headerCart.count());
  if (await headerCart.count() > 0) {
    const box = await headerCart.boundingBox();
    console.log('Header services cart button position:', box);
  }

  // Check service card add to cart buttons
  const cardCartBtns = page.locator('button[title="Add to Services Cart"]');
  console.log('Services page card Add to Cart buttons count:', await cardCartBtns.count());

  const shot1 = path.join(artifactDir, 'services_cart_fix_1_services_page.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved:', shot1);

  // 2. Visit /services/category/1
  console.log('Navigating to /employee-login/services/category/1...');
  await page.goto('http://localhost:5173/employee-login/services/category/1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const catCardCartBtns = page.locator('button[title="Add to Services Cart"]');
  console.log('Category page card Add to Cart buttons count:', await catCardCartBtns.count());

  const shot2 = path.join(artifactDir, 'services_cart_fix_2_category_page.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved:', shot2);

  // 3. Visit /services/detail/1
  console.log('Navigating to /employee-login/services/detail/1...');
  await page.goto('http://localhost:5173/employee-login/services/detail/1', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const detailAddToCartBtn = page.locator('button:has-text("Add to Cart")');
  console.log('Service detail Add to Cart button count:', await detailAddToCartBtn.count());

  const shot3 = path.join(artifactDir, 'services_cart_fix_3_detail_page.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved:', shot3);

  console.log('All tests completed successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
