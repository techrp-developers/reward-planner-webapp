import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

// Deliberate browser fault injection; successful content always comes from the live API.
const browser = await chromium.connectOverCDP('http://localhost:9223');
const context = browser.contexts()[0];
const page = await context.newPage();
const checks = [];
const report = { mode: 'standalone component with deliberately injected failures', checks };
try {
  const tree = '**/mutual-fund/category-tree/4';
  const failTree = route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Injected test failure' }) });
  await page.route(tree, failTree);
  await page.goto('http://localhost:5173/.mf-validation/mutualfund-harness.html');
  await page.getByRole('alert').waitFor();
  await page.unroute(tree, failTree);
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByRole('heading', { name: 'Mutual Fund Investment for New Investors' }).waitFor();
  checks.push('Category error and retry recovers with live data.');

  const faq = '**/mutual-fund/section-content/1';
  const failFaq = route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false }) });
  await page.route(faq, failFaq);
  await page.getByRole('searchbox').fill('systematic');
  await page.getByRole('button', { name: 'Retry FAQ search', exact: true }).waitFor();
  assert.ok(await page.locator('.mf-article-card').count() > 0);
  await page.unroute(faq, failFaq);
  await page.getByRole('button', { name: 'Retry FAQ search', exact: true }).click();
  await page.getByText('Searching FAQ articles…', { exact: true }).waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('button', { name: 'Retry FAQ search' }).count(), 0);
  checks.push('FAQ search retains successful results during partial failure and retries the failed search.');
  await page.getByRole('searchbox').fill('');

  await page.route(faq, failFaq);
  await page.getByRole('button', { name: 'Mutual Funds Basics', exact: true }).click();
  await page.getByRole('dialog').getByRole('alert').waitFor();
  await page.unroute(faq, failFaq);
  await page.getByRole('dialog').getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('dialog').locator('.mf-article-card').first().waitFor();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  checks.push('Section error and retry recovers with live articles.');

  const delayFaq = async route => {
    await new Promise(resolve => setTimeout(resolve, 800));
    try { await route.continue(); } catch { /* The dialog can cancel this request. */ }
  };
  await page.route(faq, delayFaq);
  const started = page.waitForRequest(request => request.url().endsWith('/section-content/1'));
  await page.getByRole('button', { name: 'Mutual Funds Basics', exact: true }).click();
  await started;
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await new Promise(resolve => setTimeout(resolve, 1000));
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.getByRole('alert').count(), 0);
  await page.unroute(faq, delayFaq);
  checks.push('Closing a loading dialog cancels its request without showing a later error.');

  const emptyTree = route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  await page.route(tree, emptyTree);
  await page.reload();
  await page.getByText('Mutual fund learning content will appear here when published.', { exact: true }).waitFor();
  await page.unroute(tree, emptyTree);
  checks.push('Empty category payload shows the published-content empty state.');
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.message;
  process.exitCode = 1;
} finally {
  await mkdir('.mf-validation', { recursive: true });
  await writeFile('.mf-validation/browser-states.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await page.close();
  await browser.close();
}
