// scripts/test-bdybgcard-section.mjs
import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a8b2276d-cb57-457f-8e50-c59897ae6e79';

async function testBirthdayCard() {
  console.log('🎂 Testing bdybgcard.png in Employee Birthdays Section...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // ─────────────────────────────────────────────────────────
  // 1. DESKTOP TEST (1366 x 768)
  // ─────────────────────────────────────────────────────────
  const VALID_USER_37_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

  console.log('--- 1. Testing Desktop Layout (1366x768) with LIVE Backend & Database ---');
  const desktopCtx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await desktopCtx.addInitScript((token) => {
    sessionStorage.setItem('rp_access_token', token);
    sessionStorage.setItem('rp_user_profile', JSON.stringify({
      id: 37,
      userId: 37,
      name: 'Sakshi Chavan',
      company_id: 1,
      company: 'MPS Global',
      company_name: 'MPS Global',
    }));
  }, VALID_USER_37_TOKEN);

  await desktopCtx.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    // Allow frontend and live backend requests to pass directly
    if (url.origin.includes('localhost:5173') || url.origin.includes('localhost:5000')) {
      return route.continue();
    }
    const ok = (data) => route.fulfill({ json: { success: true, data } });
    const p = url.pathname;
    if (p.includes('/terms/')) return route.fulfill({ json: { success: true, terms_accepted: true } });
    return route.continue();
  });

  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForSelector('section[aria-label="Team Birthday Celebration"]', { timeout: 15000 });
  await desktopPage.evaluate(() => document.fonts.ready);
  await desktopPage.waitForTimeout(500);

  // Take full desktop dashboard view screenshot
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, 'bdycard_01_desktop_initial.png'),
    fullPage: false,
  });
  console.log('Saved bdycard_01_desktop_initial.png');

  // Locate the Birthday Section Specifically
  const birthdaySection = desktopPage.locator('section[aria-label="Team Birthday Celebration"]');
  if (await birthdaySection.isVisible()) {
    await birthdaySection.screenshot({
      path: path.join(ARTIFACT_DIR, 'bdycard_02_desktop_section_closeup.png'),
    });
    console.log('Saved bdycard_02_desktop_section_closeup.png');
  }

  // Click Wish Button
  console.log('Clicking "Wish Monica" CTA button on desktop...');
  const wishBtnDesktop = desktopPage.locator('button:has-text("Wish"), button:has-text("Send Birthday Wishes")').first();
  if (await wishBtnDesktop.isVisible()) {
    await wishBtnDesktop.click();
    await desktopPage.waitForTimeout(600);

    await desktopPage.screenshot({
      path: path.join(ARTIFACT_DIR, 'bdycard_03_desktop_wished_state.png'),
      fullPage: false,
    });
    console.log('Saved bdycard_03_desktop_wished_state.png');
  }

  // ─────────────────────────────────────────────────────────
  // 2. MOBILE TEST (390 x 844 - iPhone / Modern Android)
  // ─────────────────────────────────────────────────────────
  console.log('--- 2. Testing Mobile Layout (390x844) with LIVE Backend & Database ---');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobileCtx.addInitScript((token) => {
    sessionStorage.setItem('rp_access_token', token);
    sessionStorage.setItem('rp_user_profile', JSON.stringify({
      id: 37,
      userId: 37,
      name: 'Sakshi Chavan',
      company_id: 1,
      company: 'MPS Global',
      company_name: 'MPS Global',
    }));
  }, VALID_USER_37_TOKEN);

  await mobileCtx.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin.includes('localhost:5173') || url.origin.includes('localhost:5000')) {
      return route.continue();
    }
    const ok = (data) => route.fulfill({ json: { success: true, data } });
    const p = url.pathname;
    if (p.includes('/terms/')) return route.fulfill({ json: { success: true, terms_accepted: true } });
    return route.continue();
  });

  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForSelector('section[aria-label="Team Birthday Celebration"]', { timeout: 15000 });
  await mobilePage.waitForTimeout(800);

  // Take mobile view screenshot
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, 'bdycard_04_mobile_view.png'),
    fullPage: false,
  });
  console.log('Saved bdycard_04_mobile_view.png');

  // Click Wish Button on mobile
  const wishBtnMobile = mobilePage.locator('button:visible', { hasText: 'Send Birthday Wishes' }).first();
  if (await wishBtnMobile.isVisible()) {
    console.log('Clicking "Send Birthday Wishes" CTA button on mobile...');
    await wishBtnMobile.click();
    await mobilePage.waitForTimeout(600);

    await mobilePage.screenshot({
      path: path.join(ARTIFACT_DIR, 'bdycard_05_mobile_wished_state.png'),
      fullPage: false,
    });
    console.log('Saved bdycard_05_mobile_wished_state.png');
  }

  await browser.close();
  console.log('🎉 All birthday card tests completed successfully!');
}

testBirthdayCard().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
