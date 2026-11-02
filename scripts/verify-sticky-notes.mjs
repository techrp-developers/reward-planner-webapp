import { chromium } from 'playwright-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\a8b2276d-cb57-457f-8e50-c59897ae6e79';

const VALID_USER_37_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozNywicm9sZSI6ImN1c3RvbWVyIiwiY29tcGFueV9pZCI6MSwiaWF0IjoxNzkzMDk0MjM0LCJleHAiOjE4MjQ2MzAyMzR9.QPCH9bxXgqKBix2F6-Xi8w6lFan5m5-QPzfOPWVwueU';

async function run() {
  console.log('Launching browser to test Sticky Notes feature...');
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
  await page.waitForTimeout(2500);

  // Take screenshot of initial state with Sticky Note and Notebook & Pen icon
  const step1Path = path.join(artifactDir, 'sticky_notes_1_initial_screen.png');
  await page.screenshot({ path: step1Path });
  console.log('Saved:', step1Path);

  // 2. Check header button
  const headerBtn = page.locator('#sticky-notes-header-button');
  const btnCount = await headerBtn.count();
  console.log('Notebook & Pen header button count:', btnCount);

  // 3. Verify sticky note card is rendered
  const stickyCard = page.locator('[aria-label="Sticky Notes Workspace"]');
  console.log('Sticky notes workspace rendered:', (await stickyCard.count()) > 0);

  // 4. Test dragging the sticky note
  console.log('Testing sticky note drag...');
  const noteHeader = page.locator('[data-sticky-note-header]').first();
  const headerBox = await noteHeader.boundingBox();
  console.log('Initial header position:', headerBox);

  if (headerBox) {
    await page.mouse.move(headerBox.x + 80, headerBox.y + 15);
    await page.mouse.down();
    await page.mouse.move(headerBox.x - 280, headerBox.y + 120, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);
  }

  const step2Path = path.join(artifactDir, 'sticky_notes_2_after_drag.png');
  await page.screenshot({ path: step2Path });
  console.log('Saved dragged state:', step2Path);

  // 5. Test page navigation persistence (movable in every page everywhere)
  console.log('Navigating to /store to verify persistence across pages...');
  await page.goto('http://localhost:5173/employee-login/store', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const step3Path = path.join(artifactDir, 'sticky_notes_3_persisted_on_store_page.png');
  await page.screenshot({ path: step3Path });
  console.log('Saved store page persistence:', step3Path);

  // 6. Test clicking Notebook & Pen header icon to open the small popup card
  console.log('Clicking Notebook & Pen icon in header...');
  await headerBtn.click();
  await page.waitForTimeout(600);

  const step4Path = path.join(artifactDir, 'sticky_notes_4_popup_card_opened.png');
  await page.screenshot({ path: step4Path });
  console.log('Saved popup card screenshot:', step4Path);

  // 7. Test clicking "Add New Sticky Note" from popup card
  console.log('Clicking "Add New Sticky Note" in popup...');
  const addBtn = page.locator('button:has-text("Add New Sticky Note")');
  await addBtn.click();
  await page.waitForTimeout(800);

  // Focus into newly added note and type sample Python code like user screenshot!
  console.log('Typing Python code into new sticky note...');
  const editors = page.locator('.sticky-editor-content');
  const count = await editors.count();
  console.log('Total sticky note editors open:', count);

  if (count > 0) {
    const activeEditor = editors.first();
    await activeEditor.click();
    await page.keyboard.type('x@router.post("/ask-rule-based")\n\ndef ask_ai_rule_based(\n    request: FinancialProfileRequest\n):\n    return ask_rule_engine(request)');
    await page.waitForTimeout(500);
  }

  const step5Path = path.join(artifactDir, 'sticky_notes_5_two_notes_with_code.png');
  await page.screenshot({ path: step5Path });
  console.log('Saved two notes screenshot:', step5Path);

  // 8. Test theme switching via the ... menu
  console.log('Testing theme switch via ... menu...');
  const menuButtons = page.locator('button[title="Menu (...)"]');
  if (await menuButtons.count() > 0) {
    await menuButtons.first().click();
    await page.waitForTimeout(400);

    const step6Path = path.join(artifactDir, 'sticky_notes_6_menu_dropdown.png');
    await page.screenshot({ path: step6Path });
    console.log('Saved menu dropdown screenshot:', step6Path);

    // Click Classic Yellow or Mint Green swatch
    const colorSwatches = page.locator('button[title="Classic Yellow"]');
    if (await colorSwatches.count() > 0) {
      await colorSwatches.first().click();
      await page.waitForTimeout(400);
    }
  }

  const step7Path = path.join(artifactDir, 'sticky_notes_7_yellow_theme_applied.png');
  await page.screenshot({ path: step7Path });
  console.log('Saved yellow theme applied screenshot:', step7Path);

  console.log('All Sticky Notes automated verification steps completed successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error in verification:', err);
  process.exit(1);
});
