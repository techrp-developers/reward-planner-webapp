import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const specs = [
  ['SIP Calculator', 'Estimate future value of your monthly SIP', 'Monthly investment value'],
  ['Goal SIP Calculator', 'Monthly investment needed to reach your goal', 'Target amount value'],
  ['Smart Goal Calculator', 'Plan goals considering existing investments', 'Existing investments value'],
  ['Inflation Calculator', 'Impact of inflation on your expenses', 'Annual inflation value'],
  ['Cost of Delay', 'Impact of delaying your investments', 'Delay in starting value'],
  ['Lumpsum Calculator', 'Calculate returns on one-time investment', 'Investment amount value'],
  ['Retirement Planning', 'Estimate your retirement corpus', 'Monthly living expense value'],
  ['Step-Up SIP Calculator', 'Future value with annual SIP increase', 'Annual SIP increase value'],
  ['SWP Calculator', 'Systematic Withdrawal Plan projections', 'Monthly withdrawal value'],
];
let browser;
try {
  browser = await chromium.connectOverCDP('http://localhost:9223');
} catch {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
}
const context = browser.contexts()[0] || await browser.newContext();
const page = await context.newPage();
const report = { mode: 'live-data component harness, not authenticated application', checks: [], layouts: [], errors: [] };
page.on('pageerror', error => report.errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
try {
  await page.goto('http://localhost:5173/.mf-validation/mutualfund-harness.html');
  await page.getByRole('heading', { name: 'Mutual Fund Investment for New Investors' }).waitFor();
  const section = page.locator('#mf-calculators');
  const cards = section.locator('.mf-calculator-card');
  assert.equal(await cards.count(), 9);
  assert.equal(await cards.locator('img, svg, .mf-calculator-art').count(), 0);
  assert.equal(await section.getByText('Tool', { exact: true }).count(), 0);
  for (const [index, [title, subtitle, field]] of specs.entries()) {
    const card = cards.nth(index);
    assert.equal(await card.locator('h3').textContent(), title);
    assert.equal(await card.locator('p').textContent(), subtitle);
    assert.equal(await card.locator(':scope > :first-child').evaluate(element => element.tagName), 'H3');
    assert.equal(await card.getByText('Calculate Now', { exact: true }).count(), 1);
    await card.focus();
    await page.keyboard.press(index % 2 ? 'Space' : 'Enter');
    const dialog = page.getByRole('dialog', { name: title, exact: true });
    await dialog.waitFor();
    assert.equal(await dialog.locator('header').count(), 1);
    assert.equal(await dialog.locator('header p').textContent(), subtitle);
    await dialog.getByRole('spinbutton', { name: field, exact: true }).waitFor();
    const output = dialog.locator('output');
    const before = await output.textContent();
    const input = dialog.locator('input[type=number]').first();
    const max = Number(await input.getAttribute('max'));
    await input.fill(String(Math.min(max, Number(await input.inputValue()) * 10)));
    await page.waitForFunction(before => document.querySelector('dialog output')?.textContent !== before, before);
    assert.ok(!(await output.textContent()).includes('NaN'));
    await input.fill('-1');
    assert.equal(Number(await input.inputValue()), Number(await input.getAttribute('min')));
    await input.fill(String(max + 1));
    assert.equal(Number(await input.inputValue()), max);
    const back = dialog.getByRole('button', { name: 'Back to calculators', exact: true });
    await back.focus();
    await page.keyboard.press('Tab');
    assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)));
    await page.keyboard.press('Shift+Tab');
    assert.ok(await back.evaluate(element => document.activeElement === element));
    await back.focus();
    await page.keyboard.press('Enter');
    await dialog.waitFor({ state: 'hidden' });
    assert.ok(await card.evaluate(element => document.activeElement === element));
    report.checks.push(`${title}: exact labels, correct form, result updates, clamping, keyboard open/back, Tab/Shift+Tab and focus restoration.`);
  }
  await cards.first().focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  report.checks.push('Escape closes the calculator dialog.');

  await mkdir('.mf-validation', { recursive: true });
  for (const [width, columns] of [[390, 1], [768, 2], [1440, 3]]) {
    await page.setViewportSize({ width, height: 1000 });
    const sizes = await cards.evaluateAll(elements => elements.map(element => ({ height: element.getBoundingClientRect().height, width: element.getBoundingClientRect().width })));
    const actualColumns = await section.locator('.grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    assert.equal(actualColumns, columns);
    assert.ok(Math.max(...sizes.map(size => size.height)) - Math.min(...sizes.map(size => size.height)) < 1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await section.screenshot({ path: `.mf-validation/calculator-grid-${width}.png` });
    await cards.first().click();
    const dialog = page.getByRole('dialog');
    assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth));
    await dialog.screenshot({ path: `.mf-validation/calculator-screen-${width}.png` });
    await dialog.getByRole('button', { name: 'Back to calculators' }).click();
    report.layouts.push({ width, columns: actualColumns, equalCardHeights: true, noHorizontalOverflow: true });
  }

  // Smoke-check sections sharing Dialog; the calculator-only wrapper must not affect them.
  await page.getByRole('button', { name: 'Mutual Funds Basics', exact: true }).click();
  await page.getByRole('dialog').locator('.mf-article-card').first().waitFor();
  await page.getByRole('dialog').locator('.mf-article-card').first().click();
  await page.locator('.mf-article-body').waitFor();
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  report.checks.push('Live FAQ section and full article dialog still use the existing header and close action.');
  assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  process.exitCode = 1;
} finally {
  await mkdir('.mf-validation', { recursive: true });
  await writeFile('.mf-validation/calculator-layout-results.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await page.close();
  await browser.close();
}
