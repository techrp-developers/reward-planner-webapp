import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'mock_quiz_layout');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({user_id:37,id:37,name:'Layout Preview'}));
    localStorage.setItem('rp_sticky_notes','[]');
  });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' && !url.pathname.startsWith('/v1')) return route.continue();
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:url.pathname.includes('user-info')?{user_id:37,id:37,name:'Layout Preview'}:[]})});
  });
  const page = await context.newPage();
  for (const [width,height] of [[1366,768],[768,1024],[390,844]]) {
    await page.setViewportSize({width,height});
    await page.goto('http://127.0.0.1:5173/employee-login/games/quiz', {waitUntil:'networkidle'});
    const section = page.getByRole('region',{name:'Quiz benefits'});
    await section.scrollIntoViewIfNeeded();
    const result = await section.evaluate(el => ({items:el.querySelectorAll('li').length,fontSize:getComputedStyle(el.querySelector('p')).fontSize,overflow:el.scrollWidth>el.clientWidth,rect:el.getBoundingClientRect().toJSON()}));
    if (result.items !== 4 || result.overflow || parseFloat(result.fontSize)!==12) throw new Error(JSON.stringify(result));
    await section.screenshot({path:`scratch/quiz-benefits-${width}.png`});
    console.log(JSON.stringify({width,...result}));
  }
} finally { await browser.close(); }

