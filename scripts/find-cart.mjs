import { chromium } from 'playwright-core';

async function test() {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'token');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({ id: 37, name: 'Sakshi' }));
  });
  await page.goto('http://localhost:5173/employee-login/services');
  const cartLink = page.locator('a[href*="services/cart"]');
  console.log('cartLink count in header:', await cartLink.count());
  if (await cartLink.count() > 0) {
    console.log('cartLink box:', await cartLink.boundingBox());
    console.log('cartLink html:', await cartLink.evaluate(el => el.outerHTML));
  }
  const allCartButtons = page.locator('button:has-text("Add to Cart"), a:has-text("Add to Cart"), [aria-label*="cart" i]');
  console.log('All cart buttons on page:', await allCartButtons.count());
  for (let i = 0; i < await allCartButtons.count(); i++) {
    console.log(i, await allCartButtons.nth(i).evaluate(el => ({ tag: el.tagName, text: el.textContent.trim(), class: el.className })));
  }
  await browser.close();
}
test();
