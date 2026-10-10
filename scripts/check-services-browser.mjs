import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createServer, preview } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';

const measurement = process.argv.find(arg => arg.startsWith('--measure='))?.split('=')[1];
const detailOnly = process.argv.includes('--detail-only');
const report = { mode: measurement || 'functional: actual App with intercepted APIs', checks: [], calls: [], errors: [] };
const server = measurement
  ? await preview({ configLoader: 'native', build: { outDir: `.services-validation/${measurement}` }, preview: { host: '127.0.0.1', port: 0, open: false } })
  : await createServer({ configLoader: 'native', cacheDir: '.services-validation/vite-cache', server: { host: '127.0.0.1', port: 0, open: false },
      plugins: [{ name: 'service-render-profile', transform(code, id) {
        if (id.replaceAll('\\', '/').endsWith('/components/services/ServiceBannerCarousel.tsx')) {
          return code.replace('const [activeIdx,', 'window.__carouselRenders = (window.__carouselRenders || 0) + 1;\n  const [activeIdx,');
        }
      } }] });
let browser;
try {
  if (!measurement) await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: measurement ? ['--remote-debugging-port=9235'] : [] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    try {
    sessionStorage.setItem('rp_access_token', 'services-test-session');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ id: 17, name: 'Test Customer', first_name: 'Test', last_name: 'Customer', phone: '9876543210', email: 'test@example.test', city: 'Mumbai', pincode: '400001' }));
    window.__razorpayOptions = [];
    window.Razorpay = class { constructor(options) { window.__razorpayOptions.push(options); } on() {} open() {} };
    } catch { /* Lighthouse also opens documents without a storage origin. */ }
  });
  const categories = [{ id: 3, name: 'Government Documents' }, { id: 4, name: 'Mutual Funds', display_type: 'content' }, { id: 2, name: 'Insurance' }, { id: 1, name: 'Tax Filing' }, { id: 5, name: 'MSEB Name Change' }, { id: 9, name: 'Other Services' }];
  const services = [{ id: 1, name: 'PAN Card', description: 'PAN support', category_name: 'Government Documents', price: 150 }, { id: 7, name: 'Income Tax Filing', description: 'Tax help', category_name: 'Tax Filing', price: 500 }];
  const detail = { service: { ...services[0], category_id: 3 }, variants: [{ id: 101, title: 'Standard PAN', price: 150, original_price: 200 }, { id: 102, title: 'Express PAN', price: 250, original_price: 300 }], service_sections: [{ section_type: 'faq', content: [{ question: 'Test FAQ question?', answer: 'Test FAQ answer.' }] }] };
  const aadhaarDetail = {
    service: { id: 2, name: 'Aadhaar Update & Correction', category_id: 3, category_name: 'Government Documents', description: 'Aadhaar document and appointment assistance.', form_title: 'Apply for Aadhaar Update', form_subtitle: 'Choose your update and share your details.' },
    variants: [{ id: 201, title: 'New Aadhaar Card', price: 300, original_price: 350, details: ['API Aadhaar overview'], journey: [{ content: [['Review documents', 'API appointment guidance']] }] }, { id: 202, title: 'Aadhaar Correction', price: 450, original_price: 500 }],
    documents: [{ id: 50, document_name: 'API Aadhaar Identity Proof', is_mandatory: true }],
    enquiry_fields: [{ field_name: 'name', label: 'Full name', field_type: 'text', is_required: true }, { field_name: 'city', label: 'City', field_type: 'text', is_required: true }, { field_name: 'mobile_number', label: 'Mobile number', field_type: 'tel', is_required: true }, ...Array.from({ length: 6 }, (_, i) => ({ field_name: `update_note_${i}`, label: `Update note ${i + 1}`, field_type: 'textarea', is_required: false }))],
  };
  let failCategories = false, failEnquiry = false, verifyPaid = true, holdBundles = false;
  let releaseBundles;
  let cartItems = [{ id: 900, service_id: 1, variant_id: 101, service_name: 'PAN Card', variant_name: 'Standard PAN', price: 150, documents: [] }];
  const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=','base64');
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === origin) return route.continue();
    if (url.hostname.includes('rewardplanners.com') && url.pathname.includes('/api/crm/')) {
      const path = url.pathname; report.calls.push({ path, method: request.method(), body: request.postData() ? request.postDataJSON() : null });
      const ok = data => route.fulfill({ json: { success: true, data } });
      if (path.endsWith('/user-info')) return ok({ id: 17, name: 'Test Customer', phone: '9876543210', email: 'test@example.test', city: 'Mumbai', pincode: '400001' });
      if (path.includes('/terms/')) return route.fulfill({ json: { success: true, terms_accepted: true, accepted: true } });
      if (path.endsWith('/category/all-categories')) return failCategories ? route.fulfill({ status: 503, json: { message: 'Temporary category failure' } }) : ok(measurement ? categories.filter(item => item.id <= 5).sort((a,b) => a.id - b.id) : categories);
      if (path.endsWith('/service/all-services')) return ok(services);
      if (path.includes('/service/by-category/')) return ok({ category: categories[0], services });
      if (path.endsWith('/service/details/1')) return ok(detail);
      if (path.endsWith('/service/details/2')) return ok(aadhaarDetail);
      if (path.endsWith('/service-banner')) return ok([{ id: 1, title: 'PAN Card', redirect: { type: 'service', id: 1 } }]);
      if (path.endsWith('/service-bundle')) { if (holdBundles) await new Promise(resolve => { releaseBundles = resolve; }); return ok([]); }
      if (path.endsWith('/service-bundle/bundle-detail/42')) return ok({ bundle: { id: 42, name: 'Test Service Pack', bundle_price: 400, original_price: 500 }, items: [{ id: 1, service_name: 'PAN Card', price: 150, individual_price: 150, bundle_price: 100 }], pricing: { bundle_price: 400, total_price: 500 }, enquiry_fields: [] });
      if (path.endsWith('/service-cart/add-bundle/42')) return ok({});
      if (path.endsWith('/service-cart/cart-items')) return ok({ individual_items: cartItems, bundles: [], total: 150, rewards: {} });
      if (path.endsWith('/service-cart/add')) {
        const body = request.postDataJSON();
        cartItems = [...cartItems, { id: 901, service_id: body.service_id, variant_id: body.variant_id, service_name: 'PAN Card', variant_name: 'Express PAN', price: 250, documents: [] }];
        return ok({});
      }
      if (path.includes('/service-cart/item/')) { cartItems = []; return ok({}); }
      if (path.endsWith('/service-enquiry')) return failEnquiry ? route.fulfill({ status: 422, json: { message: 'Enquiry rejected' } }) : ok({ id: 123, enquiry_ref: 'ENQ-123' });
      if (path.endsWith('/addresses')) return ok([{ id: 41, contact_name: 'Test Customer', contact_phone: '9876543210', address1: 'Test Street', city: 'Mumbai', state: 'Maharashtra', zipcode: '400001', is_default: 1 }]);
      if (path.includes('/service-checkout/') && path.includes('preview')) return ok({ items: cartItems, summary: { subtotal: 150, item_total: 150, handling_fee: 0 }, rewards: { max_redeem_coins: 0 } });
      if (/\/service-checkout\/(buy-now|cart|buy-now-bundle)$/.test(path)) { await new Promise(resolve => setTimeout(resolve, 150)); return ok({ parent_order_id: 'ORDER-123' }); }
      if (path.endsWith('/service-orders/create-order')) return route.fulfill({ json: { success: true, data: { key: 'test-key', amount: 15000, order_id: 'rzp-order-123', currency: 'INR' } } });
      if (path.includes('/verify-payment') || path.includes('/payment-status/')) return route.fulfill({ json: { success: verifyPaid, payment_status: verifyPaid ? 'paid' : 'pending' } });
      if (path.includes('/mutual-fund/category-tree/')) return ok([{ id: 5, title: 'Learning', has_children: true, sort_order: 1, children: [{ id: 10, title: 'Basics', sort_order: 1, articles: [{ id: 11, section_id: 10, title: 'What is SIP?', short_description: 'SIP basics', thumbnail: null }] }] }]);
      if (path.includes('/mutual-fund/section-content/')) return ok({ section: { id: 10, title: 'Basics' }, articles: [{ id: 11, title: 'What is SIP?', short_description: 'SIP basics', article_content: '<p>Learning content</p>', thumbnail: null, sort_order: 1 }] });
      return ok([]);
    }
    if (/\.(png|jpg|webp|avif)(\?|$)/.test(url.pathname)) return route.fulfill({ contentType: 'image/png', body: tinyPng });
    return route.fulfill({ status: 204, body: '' });
  });
  const page = await context.newPage(); page.on('pageerror', error => report.errors.push(error.message));
  page.setDefaultTimeout(30_000);
  const go = async path => { await page.evaluate(path => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); }, path); };
  const count = suffix => report.calls.filter(call => call.path.endsWith(suffix)).length;
  if (measurement) {
    const requests = [];
    page.on('response', async response => { if (response.url().startsWith(origin)) { try { requests.push({ url: new URL(response.url()).pathname, bytes: (await response.body()).length }); } catch {} } });
    await page.goto(origin + '/services');
    await page.getByRole('heading', { name: 'Popular & Certified Services' }).waitFor();
    await page.getByText('PAN support', { exact: true }).first().waitFor();
    await page.waitForTimeout(1200);
    report.network = { requests: requests.length, scriptBytes: requests.filter(r => r.url.endsWith('.js')).reduce((sum, r) => sum + r.bytes, 0), imageBytes: requests.filter(r => /\.(png|webp|avif|jpg)$/.test(r.url)).reduce((sum, r) => sum + r.bytes, 0), apiGets: report.calls.filter(c => c.method === 'GET').length, serviceGets: report.calls.filter(c => c.method === 'GET' && /\/service(?:-|\/)|\/category\//.test(c.path)).length };
    report.navigation = await page.evaluate(() => { const entry = performance.getEntriesByType('navigation')[0]; return { domContentLoadedMs: entry.domContentLoadedEventEnd, loadMs: entry.loadEventEnd }; });
    const puppeteer = (await import('puppeteer-core')).default;
    const connection = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9235' });
    try {
      const target = (await connection.pages()).find(target => target.url() === page.url());
      const lighthouse = (await import('lighthouse')).default;
      const desktopConfig = (await import('lighthouse/core/config/desktop-config.js')).default;
      const result = await lighthouse(origin + '/services', { onlyCategories: ['performance', 'accessibility'], screenEmulation: { mobile: false, width: 1280, height: 900, deviceScaleFactor: 1, disabled: false }, disableStorageReset: true, throttlingMethod: 'simulate' }, desktopConfig, target);
      report.lighthouse = { performance: result.lhr.categories.performance.score * 100, accessibility: result.lhr.categories.accessibility.score * 100, lcpMs: result.lhr.audits['largest-contentful-paint'].numericValue, tbtMs: result.lhr.audits['total-blocking-time'].numericValue, cls: result.lhr.audits['cumulative-layout-shift'].numericValue };
      await writeFile(`.services-validation/${measurement}-lighthouse.html`, result.report);
      await writeFile(`.services-validation/${measurement}-lighthouse.json`, JSON.stringify(result.lhr, null, 2));
    } finally { connection.disconnect(); }
  } else {
    if (!detailOnly) {
    holdBundles = true;
    await page.goto(origin + '/services');
    await page.getByRole('button', { name: /Government Documents/ }).waitFor();
    await page.getByRole('link', { name: /PAN Card/ }).first().waitFor();
    assert.ok(releaseBundles, 'Bundle request is held while other sections are usable'); releaseBundles(); holdBundles = false;
    report.checks.push('Independent sections: categories and services usable while bundles pending');
    const extra = page.getByRole('button', { name: /Other Services/ }); await extra.waitFor();
    assert.ok(await page.getByRole('button', { name: /Mutual Funds/ }).evaluate(node => node.className.includes('sm:col-span-8')));
    report.checks.push('Category IDs/layout survive reordered response and show categories beyond first five');
    const beforeRender = await page.evaluate(() => window.__carouselRenders);
    await page.getByRole('textbox', { name: 'Search services', exact: true }).fill('tax');
    await page.getByRole('link', { name: /Income Tax Filing/ }).waitFor();
    await page.getByRole('link', { name: /PAN Card/ }).waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => window.__carouselRenders), beforeRender, 'Search should not re-render banner');
    await page.getByRole('textbox', { name: 'Search services', exact: true }).fill('');
    report.checks.push('Debounced local search preserves matching; instrumented banner does not re-render on search');
    await go('/services/category/3'); await page.getByRole('heading', { name: /Available Services/ }).waitFor();
    await page.getByRole('textbox', { name: 'Search category services' }).fill('pan');
    await page.getByRole('link', { name: /Income Tax Filing/ }).waitFor({ state: 'hidden' });
    await go('/services'); await page.getByRole('button', { name: /Government Documents/ }).waitFor();
    assert.equal(count('/service/all-services'), 1); assert.equal(count('/category/all-categories'), 1);
    report.checks.push('Home remount uses cached GETs; category search preserved');
    const headerCart = page.locator('header').getByRole('link', { name: 'Services cart, 1 item', exact: true });
    await headerCart.waitFor();
    assert.equal(await headerCart.getAttribute('href'), '/services/cart');
    for (const width of [320, 375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await headerCart.boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width, `Cart must be visible at ${width}px`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Header must fit at ${width}px`);
    }
    await headerCart.click();
    await page.getByText('Standard PAN', { exact: true }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/services/cart');
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.getByRole('button', { name: /via Razorpay/ }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/services/checkout');
    report.checks.push('Visible Services cart icon links to cart and checkout at 320/375/768/1280px');
    await go('/services/detail/1'); await page.getByRole('heading', { name: 'Standard PAN', exact: true }).waitFor();
    await page.getByRole('button', { name: /Express PAN/ }).click(); await page.getByRole('heading', { name: 'Express PAN', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Test FAQ question?' }).click(); await page.getByText('Test FAQ answer.', { exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Required Documents' }).waitFor();
    report.checks.push('Detail variants, FAQ, documents render through extracted components');
    // Fill only visible form controls; the second form is hidden at this breakpoint.
    for (const field of await page.locator('form input:visible, form textarea:visible').all()) {
      const type = await field.getAttribute('type'); if (!await field.inputValue()) await field.fill(type === 'email' ? 'test@example.test' : type === 'tel' ? '9876543210' : 'Mumbai');
    }
    for (const select of await page.locator('form select:visible').all()) { const value = await select.locator('option').nth(1).getAttribute('value'); if (value) await select.selectOption(value); }
    failEnquiry = true; await page.getByRole('button', { name: 'Submit', exact: true }).filter({ visible: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Enquiry rejected' }).waitFor();
    failEnquiry = false; await page.getByRole('button', { name: 'Submit', exact: true }).filter({ visible: true }).click();
    await page.getByText('ENQ-123', { exact: false }).waitFor();
    report.checks.push('Enquiry API failure stays on form; successful server reference shown');
    await page.getByRole('button', { name: 'Back to Services', exact: true }).click();
    await go('/services/detail/1');
    await page.getByRole('button', { name: /Express PAN/ }).click();
    await page.getByRole('button', { name: 'Add to Cart', exact: true }).filter({ visible: true }).first().click();
    await page.locator('header').getByRole('link', { name: 'Services cart, 2 items', exact: true }).waitFor();
    const addCall = report.calls.find(call => call.path.endsWith('/service-cart/add'));
    assert.equal(Number(addCall.body.service_id), 1);
    assert.equal(Number(addCall.body.variant_id), 102);
    await page.locator('header').getByRole('link', { name: 'Services cart, 2 items', exact: true }).click();
    await page.waitForURL('**/services/cart');
    await page.getByRole('heading', { name: /Services Cart/ }).waitFor();
    await page.getByText('Standard PAN', { exact: true }).waitFor();
    await page.getByText('Express PAN', { exact: true }).waitFor();
    report.checks.push('Detail Add to Cart preserves service/variant payload and refreshes header count');
    await go('/services/checkout?mode=buy_now&serviceId=1&variantId=101');
    const pay = page.getByRole('button', { name: /via Razorpay/ }); await pay.waitFor();
    await pay.evaluate(node => { node.click(); node.click(); });
    await page.waitForFunction(() => window.__razorpayOptions.length === 1);
    assert.equal(count('/service-checkout/buy-now'), 1);
    await page.evaluate(() => window.__razorpayOptions[0].modal.ondismiss());
    await pay.click(); await page.waitForFunction(() => window.__razorpayOptions.length === 2);
    assert.equal(count('/service-checkout/buy-now'), 1, 'Manual payment retry must reuse existing order');
    verifyPaid = false;
    await page.evaluate(() => window.__razorpayOptions[1].handler({ razorpay_order_id: 'rzp-order-123', razorpay_payment_id: 'payment-test', razorpay_signature: 'test-signature' }));
    await page.getByText('Payment could not be verified. Check your order status before paying again.').waitFor();
    assert.equal(await page.getByText('Service Order Confirmed!', { exact: true }).count(), 0);
    verifyPaid = true;
    // Verification retry checks the existing payment status; no new payment is created.
    await page.getByRole('button', { name: 'Check payment status', exact: true }).click();
    await page.getByText('Service Order Confirmed!', { exact: true }).waitFor();
    report.checks.push('Cart and checkout: one creation for double click/retry; unverified payment never shows success; verified payment confirms');
    await go('/services/category/2'); await page.getByRole('heading', { name: /Insurance/ }).first().waitFor();
    await go('/services/mutual-funds'); await page.locator('.mf-page').waitFor();
    await page.getByRole('heading', { name: 'Mutual Fund Investment for New Investors' }).waitFor();
    for (const name of ['SIP Calculator', 'Goal SIP Calculator', 'Smart Goal Calculator', 'Inflation Calculator', 'Cost of Delay', 'Lumpsum Calculator', 'Retirement Planning', 'Step-Up SIP Calculator', 'SWP Calculator']) {
      await page.locator('#mf-calculators').getByRole('button', { name, exact: false }).first().click();
      await page.getByRole('dialog').locator('output').waitFor();
      assert.ok((await page.getByRole('dialog').locator('output').innerText()).length > 0);
      for (const width of [375, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.getByRole('dialog').evaluate(node => node.getBoundingClientRect().right <= innerWidth));
      }
      await page.getByRole('button', { name: 'Back to calculators', exact: true }).click();
    }
    report.checks.push('Insurance hub route and lazy mutual fund calculator render');
    await go('/services/bundle/42');
    await page.getByRole('heading', { name: 'Test Service Pack', exact: true }).waitFor();
    await page.getByRole('button', { name: /Add Pack to Services Cart/ }).click();
    assert.ok(report.calls.some(call => call.path.endsWith('/service-cart/add-bundle/42')));
    await page.getByRole('button', { name: /Buy This Pack Now/ }).click();
    await page.getByRole('button', { name: /via Razorpay/ }).waitFor();
    assert.ok(new URL(page.url()).searchParams.get('bundleId') === '42');
    report.checks.push('Bundle details, add-to-cart contract and bundle checkout preview route');
    await go('/services'); await page.getByRole('button', { name: /Government Documents/ }).waitFor();
    for (const width of [375, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); }
    report.checks.push('No horizontal document overflow at 375/768/1280px');
    // New session has its own cache and explicit failure/retry state.
    failCategories = true;
    await page.reload(); await page.getByRole('button', { name: 'Retry service categories' }).waitFor();
    failCategories = false; await page.getByRole('button', { name: 'Retry service categories' }).click();
    await page.getByRole('button', { name: /Government Documents/ }).waitFor();
    report.checks.push('Explicit API failure and manual retry; no mock fallback data');
    } else { await page.goto(origin + '/services/detail/2'); }
    await go('/services/detail/2');
    await page.getByRole('heading', { name: 'New Aadhaar Card', exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Apply for Aadhaar Update', exact: true }).filter({ visible: true }).waitFor();
    assert.equal(await page.getByText('Apply for PAN Card Request', { exact: true }).count(), 0);
    await page.getByText('API Aadhaar overview', { exact: true }).waitFor();
    await page.getByText('API Aadhaar Identity Proof', { exact: true }).waitFor();
    const sidebar = page.getByRole('complementary', { name: 'Service booking' });
    const formContent = page.locator('.service-detail__sidebar-content');
    for (const height of [900, 600]) {
      await page.setViewportSize({ width: 1280, height });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await sidebar.evaluate(node => getComputedStyle(node).maxHeight), 'none');
      assert.equal(await formContent.evaluate(node => getComputedStyle(node).overflowY), 'visible');
      assert.ok(await formContent.evaluate(node => node.scrollHeight <= node.clientHeight + 1), 'Full form has no clipped content');
      await sidebar.getByRole('button', { name: 'Submit', exact: true }).scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 150));
      await page.waitForFunction(() => {
        const sidebar = document.querySelector('.service-detail__sidebar').getBoundingClientRect();
        const header = document.querySelector('header').getBoundingClientRect();
        return sidebar.bottom <= innerHeight && sidebar.bottom > header.bottom;
      });
      const submit = await sidebar.getByRole('button', { name: 'Submit', exact: true }).boundingBox();
      assert.ok(submit.y >= 0 && submit.y + submit.height <= height, 'Submit stays reachable within sidebar');
      const bottomBefore = await sidebar.evaluate(node => node.getBoundingClientRect().bottom);
      await page.evaluate(() => window.scrollBy(0, 100));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const bottomAfter = await sidebar.evaluate(node => node.getBoundingClientRect().bottom);
      assert.ok(Math.abs(bottomBefore - bottomAfter) < 2, 'Sidebar ending remains anchored while document continues scrolling');
      await page.screenshot({ path: `.services-validation/detail-desktop-${height}.png` });
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('button', { name: /Aadhaar Correction/ }).click();
    await page.getByRole('heading', { name: 'Aadhaar Correction', exact: true }).waitFor();
    await sidebar.getByText('₹450', { exact: true }).waitFor();
    await sidebar.getByRole('button', { name: 'Buy Now', exact: true }).click();
    await page.getByRole('button', { name: /via Razorpay/ }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('serviceId'), '2');
    assert.equal(new URL(page.url()).searchParams.get('variantId'), '202');
    await go('/services/detail/2');
    for (const width of [320, 375, 768]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await sidebar.isVisible(), false);
      const form = page.locator('form:visible');
      await form.getByLabel('Full name', { exact: false }).waitFor();
      assert.equal(await page.locator('form:visible').count(), 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.screenshot({ path: '.services-validation/detail-mobile.png', fullPage: true });
    delete aadhaarDetail.service.form_title;
    delete aadhaarDetail.service.form_subtitle;
    delete aadhaarDetail.enquiry_fields;
    await page.reload();
    await page.getByRole('heading', { name: 'Apply for Aadhaar Update & Correction', exact: true }).filter({ visible: true }).waitFor();
    await page.locator('form:visible').getByLabel('Name', { exact: false }).waitFor();
    assert.equal(await page.getByText('Reason for PAN Card Request', { exact: false }).count(), 0);
    report.checks.push('Aadhaar uses API metadata; full desktop form has no nested scrollbar, ending stays anchored at 900/600px heights, mobile form and variant checkout stay connected');
    assert.deepEqual(report.errors, []);
  }
  await mkdir('.services-validation', { recursive: true });
  await writeFile(`.services-validation/${measurement || 'browser'}-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ checks: report.checks, network: report.network, navigation: report.navigation, lighthouse: report.lighthouse, errors: report.errors }));
} finally { await browser?.close(); if (measurement) await new Promise(resolve => server.httpServer.close(resolve)); else await server.close(); }
