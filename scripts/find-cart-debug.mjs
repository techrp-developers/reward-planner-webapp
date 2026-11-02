import { chromium } from 'playwright-core';
import path from 'path';

const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function test() {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ id: 37, userId: 37, name: 'Sakshi Chavan' }));
  });

  console.log('Testing /employee-login/services/category/1...');
  await page.goto('http://localhost:5173/employee-login/services/category/1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const cart = page.locator('header a[href*="services/cart"]');
  console.log('Header cart count on category page:', await cart.count());
  if (await cart.count() > 0) {
    console.log('Header cart boundingBox:', await cart.boundingBox());
    const box = await cart.boundingBox();
    console.log('Header cart coordinates: x =', box.x, ', y =', box.y);
  }

  await page.screenshot({ path: path.join(artifactDir, 'services_cart_header_verified.png') });
  console.log('Saved screenshot: services_cart_header_verified.png');

  console.log('Testing /employee-login/services/detail/1...');
  await page.goto('http://localhost:5173/employee-login/services/detail/1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Header cart count on detail page:', await cart.count());

  await browser.close();
}
test();
