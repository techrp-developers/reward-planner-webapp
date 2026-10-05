import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const browser = await chromium.connectOverCDP('http://localhost:9223');
try {
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().startsWith('http://localhost:5173')) || await context.newPage();
  if (!page.url().startsWith('http://localhost:5173')) await page.goto('http://localhost:5173/services/mutual-funds');
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push({ type: 'pageerror', message: error.message }));
  page.on('console', message => { if (message.type() === 'error') diagnostics.push({ type: 'console', message: message.text() }); });
  const result = await page.evaluate(async () => {
    const mf = await import('/src/api/mutualFundApi.ts');
    const categories = await mf.getMutualFundCategories();
    const faqIds = categories.filter(category => !category.has_children).map(category => category.id);
    const childIds = categories.flatMap(category => category.children || []).map(section => section.id);
    const sections = [];
    for (const id of [...faqIds, ...childIds]) {
      const content = await mf.getSectionContent(id);
      sections.push({ id: content.section.id, articles: content.articles.length, correctlyMapped: content.articles.every(article => article.section_id === id) });
    }
    const article = await mf.getArticleDetails(12, 27);
    const missing = await mf.getArticleDetails(12, 99999999);
    const findResponse = await fetch(`${mf.BASE_API_URL}mutual-fund/find/27`);
    const find = await findResponse.json();
    return {
      origin: location.origin,
      baseURL: mf.BASE_API_URL,
      configuredCategory: mf.MF_CATEGORY_ID,
      categoryIds: categories.map(category => category.id),
      faqIds, childIds, sections,
      article: { id: article?.id, sectionId: article?.section_id, hasHtml: Boolean(article?.article_content), thumbnail: article?.thumbnail, banner: article?.banner_image },
      missingArticleIsNull: missing === null,
      find: { status: findResponse.status, success: find.success, id: find.data?.id, sectionId: find.data?.section_id, hasHtml: Boolean(find.data?.article_content) },
    };
  });
  assert.equal(result.origin, 'http://localhost:5173');
  assert.equal(result.baseURL, 'https://rewardplanners.com/api/crm/v1/');
  assert.equal(result.article.id, 27);
  assert.equal(result.article.sectionId, 12);
  assert.ok(result.article.hasHtml);
  assert.ok(result.missingArticleIsNull);
  assert.ok(result.sections.every(section => section.correctlyMapped));
  const signedInPageVisible = await page.locator('.mf-page').count() > 0;
  await mkdir('.mf-validation', { recursive: true });
  await writeFile('.mf-validation/browser-api-results.json', JSON.stringify({ ...result, signedInPageVisible, diagnostics }, null, 2));
  console.log(JSON.stringify({ origin: result.origin, baseURL: result.baseURL, faqIds: result.faqIds, childIds: result.childIds, find: result.find, signedInPageVisible, diagnostics, resultFile: '.mf-validation/browser-api-results.json' }, null, 2));
} finally {
  await browser.close();
}
