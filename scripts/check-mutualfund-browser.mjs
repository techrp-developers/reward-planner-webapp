import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const standalone = process.argv.includes('--component');
const browser = await chromium.connectOverCDP('http://localhost:9223');
const report = { mode: standalone ? 'standalone component (not signed-in application)' : 'signed-in application', origin: 'http://localhost:5173', flows: [], responses: [], errors: [], expectedFailures: [] };
let page;
try {
  const context = browser.contexts()[0];
  page = standalone ? await context.newPage() : context.pages().find(p => p.url().startsWith('http://localhost:5173') && !p.url().includes('/.mf-validation/'));
  if (!page) throw new Error('Signed-in test tab is unavailable.');
  page.on('response', response => {
    if (/mutual-fund|cdn\.rewardplanners/.test(response.url()) || response.status() >= 400) report.responses.push({ url: response.url(), status: response.status() });
  });
  page.on('pageerror', error => report.errors.push({ type: 'pageerror', message: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') report.errors.push({ type: 'console', message: message.text() });
  });
  page.on('requestfailed', request => {
    if (/mutual-fund|cdn\.rewardplanners/.test(request.url())) report.errors.push({ type: 'network', url: request.url(), message: request.failure()?.errorText });
  });
  if (standalone) await page.goto('http://localhost:5173/.mf-validation/mutualfund-harness.html');
  else await page.goto('http://localhost:5173/services/mutual-funds');
  await page.locator('.mf-page').waitFor({ timeout: 15000 });
  await page.getByRole('heading', { name: 'Mutual Fund Investment for New Investors' }).waitFor();
  await page.getByRole('heading', { name: 'Mutual Fund Investment for Savvy Investors' }).waitFor();
  report.flows.push('Category 4, beginner 5 and informed investor 6 loaded through the live client.');

  const data = await page.evaluate(async () => {
    const { getMutualFundCategories } = await import('/src/api/mutualFundApi.ts');
    return getMutualFundCategories();
  });
  const closeDialog = async () => { await page.getByRole('button', { name: 'Close dialog', exact: true }).click(); };
  for (const category of data.filter(category => !category.has_children)) {
    await page.getByRole('button', { name: category.title, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('.mf-article-card').first().waitFor();
    await dialog.locator('.mf-article-card').first().click();
    await dialog.locator('.mf-article-body').waitFor();
    await closeDialog();
    report.flows.push(`FAQ section ${category.id} and its article dialog.`);
  }

  const rows = data.filter(category => category.has_children);
  for (let index = 0; index < rows.length; index++) {
    for (const child of rows[index].children) {
      await page.getByRole('button', { name: 'Browse topics', exact: true }).nth(index).click();
      await page.getByRole('dialog').getByRole('button', { name: child.title, exact: true }).click();
      await page.getByRole('dialog').locator('.mf-article-card').first().waitFor();
      await page.getByRole('dialog').locator('.mf-article-card').first().click();
      await page.getByRole('dialog').locator('.mf-article-body').waitFor();
      const articleImages = await page.getByRole('dialog').locator('img').evaluateAll(images => images.map(image => ({ src: image.src, loaded: image.complete && image.naturalWidth > 0 })));
      assert.ok(articleImages.every(image => !image.src.includes('/https://')));
      await closeDialog();
      report.flows.push(`Child section ${child.id}, article lookup and normalized dialog images.`);
    }
  }

  const search = page.getByRole('searchbox');
  await search.fill('systematic');
  await page.getByText('Searching FAQ articles…', { exact: true }).waitFor({ state: 'hidden', timeout: 20000 });
  await page.waitForFunction(() => [...document.querySelectorAll('h2')].some(element => /[1-9]\d* matching articles/.test(element.textContent)));
  assert.equal(await page.getByRole('button', { name: 'Retry FAQ search' }).count(), 0);
  await search.fill('zzzz-no-such-article');
  await page.getByText('0 matching articles', { exact: true }).waitFor();
  await search.fill('');
  report.flows.push('FAQ search includes fetched top-level articles; unmatched query shows an empty state.');

  // Inspect a real article's CTA and verify its existing planning-tool behavior.
  await page.locator('.mf-learning-section .mf-article-card').first().click();
  await page.locator('.mf-article-body').waitFor();
  const cta = page.getByRole('dialog').locator('.mf-primary-button');
  if (await cta.count()) {
    await cta.click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    report.flows.push('Article CTA closes the dialog and scrolls to planning tools.');
  } else await closeDialog();

  const cards = page.locator('.mf-calculator-card');
  assert.equal(await cards.count(), 9);
  for (let index = 0; index < 9; index++) {
    await cards.nth(index).click();
    const output = page.getByRole('dialog').locator('output');
    const before = await output.textContent();
    const amount = page.getByRole('dialog').locator('input[type=number]').first();
    const value = Number(await amount.inputValue());
    await amount.fill(String(Math.min(Number(await amount.getAttribute('max')), value * 10)));
    await page.waitForFunction(before => document.querySelector('dialog output')?.textContent !== before, before);
    assert.ok(!(await output.textContent()).includes('NaN'));
    await page.getByRole('button', { name: 'Back to calculators', exact: true }).click();
  }
  report.flows.push('All nine calculator dialogs respond to investment/expense input changes.');

  const rail = page.locator('.mf-learning-section').first().locator('div.snap-x');
  const scrollBefore = await rail.evaluate(element => element.scrollLeft);
  await page.locator('.mf-learning-section').first().getByRole('button', { name: /Scroll .* right/ }).click();
  await page.waitForFunction(() => document.querySelector('.mf-learning-section .snap-x')?.scrollLeft > 0);
  assert.ok(await rail.evaluate(element => element.scrollLeft) > scrollBefore);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  report.flows.push('Carousel controls and 390px responsive layout without page overflow.');

  const images = page.locator('.mf-learning-section img');
  await images.first().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.mf-learning-section img')].some(image => image.complete && image.naturalWidth > 0));
  const firstImageSrc = await images.first().getAttribute('src');
  const breakImage = route => route.abort('failed');
  await page.route(firstImageSrc, breakImage);
  await page.locator('.mf-learning-section img').first().evaluate(image => { image.dispatchEvent(new Event('error')); });
  await page.locator('.mf-learning-section').first().getByRole('img', { name: 'Mutual fund learning illustration' }).first().waitFor();
  await page.unroute(firstImageSrc, breakImage);
  report.flows.push('Loaded live thumbnails and graceful broken-image fallback.');
  await mkdir('.mf-validation', { recursive: true });
  await page.screenshot({ path: `.mf-validation/${standalone ? 'component' : 'signed-in'}-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: `.mf-validation/${standalone ? 'component' : 'signed-in'}-desktop.png`, fullPage: true });
  assert.ok(report.responses.filter(response => !report.expectedFailures.includes(response.url)).every(response => response.status === 200));
  assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.message;
  process.exitCode = 1;
} finally {
  await mkdir('.mf-validation', { recursive: true });
  const file = `.mf-validation/${standalone ? 'component' : 'signed-in'}-flows.json`;
  await writeFile(file, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ mode: report.mode, passed: report.passed, flows: report.flows, errors: report.errors, failure: report.failure, file }, null, 2));
  if (standalone) await page?.close();
  await browser.close();
}
