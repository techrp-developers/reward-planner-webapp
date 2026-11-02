import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function main() {
  console.log('Verifying updated Ecommerce UI...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop Viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  await desktopContext.addInitScript((token) => {
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

  const page = await desktopContext.newPage();

  // Visit /store
  console.log('Navigating to /store (Store Landing)...');
  await page.goto('http://localhost:5173/employee-login/store', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Close sticky note if open or click somewhere
  const stickyCloseBtn = page.locator('button[title*="Close" i], button:has-text("✕")').first();
  if (await stickyCloseBtn.count() > 0 && await stickyCloseBtn.isVisible()) {
    try { await stickyCloseBtn.click(); } catch (_) {}
  }

  // Screenshot 1: Store Landing Header & Categories Section
  const categoriesSection = page.locator('text=Categories').first();
  if (await categoriesSection.count() > 0) {
    await categoriesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
  }
  const shot1 = path.join(artifactDir, 'updated_store_categories_section.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved categories section screenshot:', shot1);

  // Screenshot 2: Scroll to Bottom Category Tab Grid
  const categoryTabGrid = page.locator('text=Products').last();
  if (await categoryTabGrid.count() > 0) {
    await categoryTabGrid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
  }
  const shot2 = path.join(artifactDir, 'updated_store_category_tab_grid.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved category tab grid screenshot:', shot2);

  // Screenshot 3: All Products Catalog Mode
  console.log('Navigating to /store?view=all (All Products Catalog)...');
  await page.goto('http://localhost:5173/employee-login/store?view=all', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const shot3 = path.join(artifactDir, 'updated_store_all_products_catalog.png');
  await page.screenshot({ path: shot3 });
  console.log('Saved all products catalog screenshot:', shot3);

  // Screenshot 4: Category Selected Catalog Mode (e.g., Electronics or Beauty)
  console.log('Navigating to /store?category=1 (Category Products Catalog)...');
  await page.goto('http://localhost:5173/employee-login/store?category=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const shot4 = path.join(artifactDir, 'updated_store_category_catalog.png');
  await page.screenshot({ path: shot4 });
  console.log('Saved category catalog screenshot:', shot4);

  // 2. Mobile Viewport (390 x 844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  await mobileContext.addInitScript((token) => {
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

  const mobilePage = await mobileContext.newPage();
  console.log('Navigating to /store on mobile viewport...');
  await mobilePage.goto('http://localhost:5173/employee-login/store', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1500);
  const shot5 = path.join(artifactDir, 'updated_store_mobile_landing.png');
  await mobilePage.screenshot({ path: shot5 });
  console.log('Saved mobile landing screenshot:', shot5);

  console.log('Navigating to /store?view=all on mobile viewport...');
  await mobilePage.goto('http://localhost:5173/employee-login/store?view=all', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1500);
  const shot6 = path.join(artifactDir, 'updated_store_mobile_all_products.png');
  await mobilePage.screenshot({ path: shot6 });
  console.log('Saved mobile all products screenshot:', shot6);

  await browser.close();
  console.log('Verification completed successfully!');
}

main().catch(console.error);
