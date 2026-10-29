import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
const context = await browser.newContext();
await context.addInitScript(() => {
 sessionStorage.setItem('rp_access_token','test_bdy_session');
 sessionStorage.setItem('rp_user_profile',JSON.stringify({id:37,name:'Sakshi Chavan',company:'MPS Global',company_name:'MPS Global'}));
});
await context.route('**/*', route => {
 const url = new URL(route.request().url());
 if (url.hostname === '127.0.0.1') return route.continue();
 if (url.hostname.includes('unsplash.com')) return route.continue();
 if (url.hostname.includes('google')) return route.continue();
 if (url.pathname.endsWith('/user-info')) return route.fulfill({json:{success:true,data:{id:37,name:'Sakshi Chavan',company:'MPS Global',company_name:'MPS Global'}}});
 if (url.pathname.includes('/terms/')) return route.fulfill({json:{success:true,terms_accepted:true}});
 return route.fulfill({json:{success:true,data:[]}});
});
const page = await context.newPage();
await fs.mkdir('scratch/birthday-review',{recursive:true});
await page.goto('http://127.0.0.1:5173/employee-login/',{waitUntil:'domcontentloaded'});
const section = page.locator('section[aria-label="Team Birthday Celebration"]');
await section.waitFor({timeout:30000});
for (const width of [1920,1366,768,390]) {
 await page.setViewportSize({width,height:1000});
 await page.evaluate(()=>document.fonts.ready);
 await section.screenshot({path:`scratch/birthday-review/${width}.png`});
 console.log('Photo circle', await page.locator('.birthday-feature-photo').evaluate(el=>{const r=el.getBoundingClientRect();if(Math.abs(r.width-r.height)>1)throw new Error('Avatar is not square');return {width:r.width,height:r.height};}));
 console.log(width,await section.evaluate(el=>({width:el.clientWidth,height:el.clientHeight,overflow:el.scrollWidth>el.clientWidth,featured:el.querySelector('.birthday-feature-details').textContent})));
}
await page.getByRole('button',{name:'Next upcoming birthdays',exact:true}).click();
console.log('Pagination works');
} finally {await browser.close();}
