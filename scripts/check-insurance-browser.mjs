import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';

// Only this test server replaces Firebase writes. Production modules and imports are unchanged.
const firebaseId = '\0insurance-test-firebase';
const entryId = '\0insurance-test-entry';
const server = await createServer({
  configLoader: 'native',
  cacheDir: '.insurance-validation/vite-cache',
  server: { host: '127.0.0.1', port: 0, strictPort: false, open: false },
  plugins: [{
    name: 'insurance-browser-check', enforce: 'pre',
    resolveId(id, importer) {
      if (id === 'virtual:insurance-test-entry') return entryId;
      if (id === './FirebaseService' && importer?.replaceAll('\\', '/').endsWith('/insurance/api/insuranceFlow.ts')) return firebaseId;
    },
    load(id) {
      if (id === firebaseId) return `export async function createFirebaseEnquiry(payload, key) { window.__firebaseWrites ||= []; window.__firebaseWrites.push({ payload, key }); if (window.__firebaseReject) throw new Error('Storage unavailable'); return {success:true,id:key}; }`;
      if (id === entryId) return `import React from 'react'; import { createRoot } from 'react-dom/client'; import App from '/src/App.tsx'; import '/src/index.css'; createRoot(document.getElementById('root')).render(React.createElement(App));`;
    },
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/services/') || !req.url.includes('/quote')) return next();
        res.setHeader('Content-Type', 'text/html');
        res.end(await vite.transformIndexHtml(req.url, '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/@id/__x00__insurance-test-entry"></script></body></html>'));
      });
    },
  }],
});
let browser;
const report = { mode: 'Production App and insurance modules; intercepted APIs and Firebase test adapter', passed: [], calls: [], pageErrors: [] };
try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    sessionStorage.setItem('rp_access_token', 'insurance-test-token');
    sessionStorage.setItem('rp_user_profile', JSON.stringify({first_name:'Test',last_name:'Customer',phone:'9876543210',city:'Mumbai',pincode:'400001'}));
  });
  let enquiry = 100;
  let rejectStep = false;
  const savedMembers = new Map();
  let premiumMode = 'success';
  let pendingQuotes = 0;
  const quote = { company: {company_name:'Fixture insurer',company_id:41}, plan:{plan_name:'Fixture protection',plan_id:52}, premiums:[{premium:'₹12,345',deductible:500000}], features:['Hospitalisation cover'] };
  await context.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const policyProxy = url.origin === origin && url.pathname.startsWith('/api/policyplanner/');
    if (policyProxy) url.pathname = url.pathname.replace('/api/policyplanner', '');
    if (url.origin === origin && !policyProxy) return route.continue();
    if (url.hostname.endsWith('rewardplanners.com') && url.pathname.includes('/api/crm/')) {
      const body = req.postDataJSON();
      if (url.pathname.includes('/insurance/')) {
        report.calls.push({path:url.pathname,body,authorization:req.headers().authorization});
        if (url.pathname.endsWith('/start')) return route.fulfill({json:{success:true,data:{enquiry_id:String(++enquiry)}}});
        if (url.pathname.endsWith('/save-step') && rejectStep) { rejectStep=false; return route.fulfill({status:422,json:{message:'Step service unavailable'}}); }
        if (url.pathname.endsWith('/save-step') && body.section === 'members') savedMembers.set(body.enquiry_id,body.data);
        if (url.pathname.endsWith('/complete')) {
          const members = savedMembers.get(body.enquiry_id);
          if (!Array.isArray(members) || !members.length || members.some(member => !Number.isInteger(member.age) || member.age < 1)) return route.fulfill({status:400,json:{message:'Members missing or invalid'}});
        }
        if (url.pathname.endsWith('/get-quotes')) {
          if (pendingQuotes-- > 0) return route.fulfill({status:409,json:{message:'Quotes are processing'}});
          return route.fulfill({json:{success:true,data:{quotes:[{id:'crm-quote',data:quote}]}}});
        }
        return route.fulfill({json:{success:true}});
      }
      if (url.pathname.endsWith('/category/all-categories')) return route.fulfill({json:{success:true,data:[{id:2,name:'Insurance',display_type:'list'}]}});
      if (url.pathname.endsWith('/service/all-services')) return route.fulfill({json:{success:true,data:[{id:12,name:'Health Insurance',description:'Health cover'},{id:501,name:'Personal Accident',description:'Accident cover'},{id:502,name:'Super Top-Up',description:'Additional cover'}]}});
      if (url.pathname.endsWith('/user-info')) return route.fulfill({json:{success:true,data:{first_name:'Test',last_name:'Customer',phone:'9876543210',city:'Mumbai',pincode:'400001'}}});
      if (url.pathname.includes('/terms/')) return route.fulfill({json:{success:true,terms_accepted:true}});
      return route.fulfill({json:{success:true,data:[]}});
    }
    if (url.hostname === 'policyplanner.com' || policyProxy) {
      if (url.pathname.includes('/assets/')) return route.fulfill({status:404,body:''});
      assert.equal(req.headers().authorization, undefined, 'CRM token must never be sent to PolicyPlanner');
      if (req.method() === 'OPTIONS') return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'content-type'}});
      const headers = {'Access-Control-Allow-Origin':'*'};
      if (url.pathname.endsWith('/companies/plans')) {
        const policy = url.searchParams.get('policy');
        return route.fulfill({headers,json:{success:true,data:[{api_type:`https://policyplanner.com/health-insurance/hdfc/${policy}-premium`},{api_type:`https://policyplanner.com/health-insurance/nic/${policy}-premium`}]}});
      }
      report.calls.push({path:url.pathname,body:req.postDataJSON(),authorization:req.headers().authorization});
      if (premiumMode === 'failure') return route.fulfill({headers,status:503,json:{message:'Insurer unavailable'}});
      if (url.pathname.includes('/nic/')) return route.fulfill({headers,json:{success:false,error:'Not eligible'}});
      return route.fulfill({headers,json:{success:true,data:quote}});
    }
    return route.fulfill({status:204,body:''});
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.setDefaultTimeout(30000);
  const go = async (product) => {
    await page.goto(`${origin}/services/${product}/quote`, {waitUntil:'domcontentloaded',timeout:60000});
    await page.getByRole('heading',{name:'Who needs cover?',exact:true}).or(page.getByRole('heading',{name:'Who will be insured?',exact:true})).waitFor();
  };
  const next = async () => { await page.getByRole('button',{name:'Continue',exact:true}).click(); };
  const selectFamily = async () => {
    await page.getByRole('button',{name:'Male',exact:true}).click();
    for (const member of ['Self','Spouse','Son']) await page.getByRole('button',{name:member,exact:true}).click();
    await page.getByRole('button',{name:'Add one son'}).click();
    await next();
    await page.getByRole('heading',{name:'How old is everyone?'}).waitFor();
    for (const [member,age] of [['Self','30'],['Spouse','28'],['Son 1','6'],['Son 2','3']]) await page.getByLabel(`${member} age`,{exact:true}).selectOption(age);
    await next();
    await page.getByRole('heading',{name:'Shape your cover'}).waitFor();
  };
  const completeFamily = async () => {
    await page.getByLabel('Cover amount',{exact:true}).selectOption('10 Lakh');
    await page.getByRole('checkbox').check();
    await page.getByRole('button',{name:'Compare quotes',exact:true}).click();
    await page.getByRole('heading',{name:'Fixture insurer',exact:true}).waitFor();
  };
  const checkWidths = async () => {
    for (const width of [320,375,768,1280,1440]) {
      await page.setViewportSize({width,height:900});
      const overflow = await page.locator('main').evaluate((main) => [...main.querySelectorAll('form, article, section, input, select, button')].filter(el => { const r=el.getBoundingClientRect(); return r.width && (r.right > window.innerWidth + 1 || r.left < -1); }).map(el=>el.tagName+':'+el.textContent.slice(0,50)));
      assert.deepEqual(overflow,[],`Overflow at ${width}px`);
    }
    await page.setViewportSize({width:1280,height:900});
  };
  await page.goto(`${origin}/insurance`, {waitUntil:'domcontentloaded',timeout:60000});
  await page.getByRole('heading',{name:'Insurance',exact:true}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/services/category/2');
  for (const [label,path] of [['Health Insurance','health-insurance'],['Super Top-Up','super-top-up'],['Personal Accident','personal-accident']]) {
    await page.getByRole('link',{name:`Compare ${label} quotes`,exact:true}).click();
    await page.getByRole('heading',{name:label,exact:true}).first().waitFor();
    assert.equal(new URL(page.url()).pathname,`/services/${path}/quote`);
    await page.goBack({waitUntil:'domcontentloaded'});
    await page.getByRole('heading',{name:'Insurance',exact:true}).waitFor();
  }
  await page.goto(`${origin}/services`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('.screen-services').getByRole('heading',{name:'Insurance',exact:true}).click();
  await page.getByRole('heading',{name:'Insurance',exact:true}).waitFor();
  await page.goto(`${origin}/services/detail/12`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.getByRole('button',{name:'Compare quotes',exact:true}).first().click();
  await page.getByRole('heading',{name:'Who needs cover?',exact:true}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/services/health-insurance/quote');
  assert.equal(await page.getByRole('dialog').count(),0);
  report.passed.push('Insurance navigation: /insurance redirects to product hub; all three cards open quote routes; Services category and Health detail CTA connect to the new flows');
  await go('health-insurance');
  const helpers = await page.evaluate(async () => {
    const dates = await import('/src/modules/services/insurance/utils/insuranceUtils.ts');
    const validation = await import('/src/modules/services/insurance/utils/insuranceValidation.ts');
    const mappers = await import('/src/modules/services/insurance/insurancePayloadMappers.ts');
    const builders = await import('/src/modules/services/insurance/api/enquiryPayloadBuilders.ts');
    const display = await import('/src/modules/services/insurance/utils/insuranceQuoteUtils.ts');
    const form = {gender:'Male',members:['self','son'],memberCounts:{son:2,daughter:3},ages:{self:30,son_1:6,son_2:3},details:{deductible:'500000'}};
    const normalized = mappers.normalizeQuotesForUi({data:{quotes:[{success:true,data:{success:false,error:'Rejected'}},{data:{company:'Sample insurer',plan:'Sample plan',premium:'\u20b91,234'}}]}});
    return {
      invalidDate:dates.isValidDateOfBirth('2025-02-29'), invalidDay:dates.isValidDateOfBirth('2024-02-31'), leapDate:dates.isValidDateOfBirth('1996-02-29'),
      normalizedDob:dates.normalizeDateOfBirth('29/02/1996'), zone:dates.getZoneFromCity(' Mumbai '),
      family:validation.buildFamilyPremiumPayload(form,1000000), crmAges:mappers.mapMembersAges(form),
      firebase:builders.buildHealthEnquiryData(form,1000000), supertopup:builders.buildSuperTopupEnquiryData(form,1000000),
      rejectedSuccess:normalized[0].success, company:display.getCompanyName(normalized[1].data,''), premium:display.getPremiumAmount(normalized[1].data),
      selected:display.buildSelectedPlanPayload(display.normalizeQuoteForDisplay({url:'https://policyplanner.com/health-insurance/care/1002/202/pa',success:true,data:{company:'Care',plan:'PA',premium:1234}},1000000,'PA')),
      tooManyChildren:validation.validateMembers({...form,members:['self','son','daughter'],memberCounts:{son:3,daughter:2}}),
      childOnly:validation.buildFamilyPremiumPayload({...form,members:['son']},1000000),
    };
  });
  assert.equal(helpers.invalidDate,false); assert.equal(helpers.invalidDay,false); assert.equal(helpers.leapDate,true);
  assert.equal(helpers.normalizedDob,'1996-02-29'); assert.equal(helpers.zone,'1');
  assert.equal(helpers.family.c2age,3); assert.equal(helpers.crmAges.at(-1).age,3);
  assert.equal(helpers.firebase.daughterCount,'0'); assert.equal(helpers.supertopup.son2Age,'3');
  assert.equal(helpers.rejectedSuccess,false); assert.equal(helpers.company,'Sample insurer'); assert.equal(helpers.premium,1234); assert.equal(helpers.selected.companyId,'1002'); assert.equal(helpers.selected.planId,'202');
  assert.ok(helpers.tooManyChildren.members); assert.equal(helpers.childOnly.age,6); assert.equal(helpers.childOnly.c1age,3); assert.equal(helpers.childOnly.c2age,null);
  report.passed.push('Helpers: real-date and leap-year validation, DOB conversion, city zone, child keys, deselected counts, child-only payload and nested quote failures');
  await next();
  assert.match(await page.getByRole('alert').innerText(), /gender/i);
  await page.getByRole('button',{name:'Male',exact:true}).click();
  const maleSelf = await page.getByRole('button',{name:'Self',exact:true}).locator('img').getAttribute('src');
  await page.getByRole('button',{name:'Female',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Spouse',exact:true}).locator('img').getAttribute('src'),maleSelf);
  await page.getByRole('button',{name:'Daughter',exact:true}).click();
  await page.getByRole('button',{name:'Add one daughter'}).click();
  await page.getByRole('button',{name:'Remove one daughter'}).click();
  await page.getByRole('button',{name:'Daughter',exact:true}).click();
  await selectFamily();
  assert.equal(await page.getByLabel('First name',{exact:true}).inputValue(),'Test');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  assert.equal(await page.getByLabel('Son 2 age',{exact:true}).inputValue(),'3');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:'Remove one son'}).click();
  await next();
  assert.equal(await page.getByLabel('Son age',{exact:true}).inputValue(),'6');
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:'Add one son'}).click();
  await next();
  assert.equal(await page.getByLabel('Son 2 age',{exact:true}).inputValue(),'3');
  rejectStep=true;
  await next();
  await page.getByRole('alert').filter({hasText:'Step service unavailable'}).waitFor();
  await page.getByRole('heading',{name:'How old is everyone?'}).waitFor();
  await next();
  await page.getByRole('heading',{name:'Shape your cover'}).waitFor();
  await page.getByLabel('Mobile number',{exact:true}).fill('123');
  await page.getByRole('button',{name:'Compare quotes',exact:true}).click();
  assert.equal(await page.getByLabel('Mobile number',{exact:true}).getAttribute('aria-invalid'),'true');
  await page.getByLabel('Mobile number',{exact:true}).fill('9876543210');
  await checkWidths();
  savedMembers.delete(101);
  await completeFamily();
  await checkWidths();
  const healthPremium = report.calls.find(call=>call.path.endsWith('/hdfc/Health-premium'));
  assert.deepEqual(healthPremium.body,{coverAmount:1000000,zone:'1',age:30,sage:28,c1age:6,c2age:3,c3age:null,c4age:null});
  assert.equal(await page.getByRole('button',{name:'Choose Plan',exact:true}).count(),1);
  await page.getByRole('button',{name:'Choose Plan',exact:true}).evaluate(button=>{button.click();button.click();});
  await page.getByRole('button',{name:'Selected',exact:true}).waitFor();
  const selections=report.calls.filter(call=>call.path.endsWith('/select-plan'));
  assert.equal(selections.length,1);
  assert.equal(selections[0].body.plan.selectedPremium,12345);
  assert.equal(selections[0].body.plan.planId,'52');
  const firebase=await page.evaluate(()=>window.__firebaseWrites);
  assert.equal(firebase[0].key,'101');
  assert.equal(firebase[0].payload.enquiry_data.son2Age,'3');
  await page.getByRole('button',{name:'Edit details',exact:true}).click();
  assert.equal(await page.getByLabel('Cover amount',{exact:true}).inputValue(),'10 Lakh');
  await completeFamily();
  assert.equal(report.calls.filter(call=>call.path.endsWith('/start')).length,1);
  assert.equal((await page.evaluate(()=>window.__firebaseWrites))[1].key,'101');
  report.passed.push('Health: gender, counts, unique ages, prefill, validation, failed-step retry, back/edit state, insurer payload, partial failure, single plan selection, stable Firebase key and repair of missing CRM members on submission');

  await page.getByRole('button',{name:'Edit details',exact:true}).click();
  await page.getByRole('link',{name:'Super Top-Up',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Self',exact:true}).getAttribute('aria-pressed'),'false');
  await selectFamily();
  assert.match(await page.getByLabel('Deductible',{exact:true}).inputValue(),/5,00,000/);
  premiumMode='failure'; pendingQuotes=1;
  await completeFamily();
  const topup=report.calls.find(call=>call.path.endsWith('/hdfc/super_top_up-premium'));
  assert.equal(topup.body.deductible,500000);
  assert.equal(topup.body.c2age,3);
  assert.equal(report.calls.filter(call=>call.path.endsWith('/get-quotes')).length,2);
  assert.equal(report.calls.filter(call=>call.path.endsWith('/start')).at(-1).body.insurance_type,'super_topup');
  assert.equal((await page.evaluate(()=>window.__firebaseWrites)).at(-1).payload.enquiry_data.son2Age,'3');
  report.passed.push('Super Top-Up: route reset, canonical CRM identifier, full child payload and deductible, correct premium endpoint, CRM fallback and pending quote retry');

  premiumMode='success';
  await go('personal-accident');
  assert.equal(await page.getByRole('button',{name:'Spouse',exact:true}).count(),0);
  await page.getByRole('button',{name:'Female',exact:true}).click();
  await next();
  await page.getByRole('heading',{name:'Tell us about yourself'}).waitFor();
  await page.getByLabel('Date of birth',{exact:true}).fill('1996-02-29');
  await next();
  await page.getByRole('heading',{name:'Additional details',exact:true}).waitFor();
  await checkWidths();
  await page.getByLabel('Occupation of insured',{exact:true}).selectOption('Salaried');
  await page.getByLabel('Annual income range',{exact:true}).selectOption({index:1});
  await page.getByLabel('Nature of work / designation',{exact:true}).selectOption('Engineers on site');
  await page.getByLabel('Cover amount',{exact:true}).selectOption('10 Lakh');
  await page.getByRole('checkbox').check();
  await page.evaluate(()=>{window.__firebaseReject=true;});
  await page.getByRole('button',{name:'Compare quotes',exact:true}).click();
  await page.getByRole('heading',{name:'Fixture insurer',exact:true}).waitFor();
  await page.getByRole('status').filter({hasText:'Firebase record could not be confirmed'}).waitFor();
  const pa=report.calls.find(call=>call.path.endsWith('/hdfc/pa-premium'));
  assert.equal(pa.body.category,2);
  assert.ok(pa.body.age>=30);
  const paDetails=report.calls.filter(call=>call.path.endsWith('/save-step')&&call.body.section==='personal_accident').at(-1);
  assert.equal(paDetails.body.data.dob,'1996-02-29');
  assert.deepEqual(paDetails.body.data.members,['self']);
  assert.equal(paDetails.body.data.occupation,'Salaried');
  const paStart=report.calls.filter(call=>call.path.endsWith('/start')).at(-1);
  assert.equal(paStart.body.insurance_type,'personal_accident');
  const paSaves=report.calls.filter(call=>call.path.endsWith('/save-step')&&call.body.enquiry_id===103);
  assert.ok(paSaves.some(call=>call.body.section==='members'));
  assert.ok(paSaves.some(call=>call.body.section==='basic'));
  report.passed.push('Personal Accident: self only, DOB, occupation/income, risk category, CRM progression, correct PA endpoint and visible Firebase failure');
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await page.getByRole('heading',{name:'Who will be insured?',exact:true}).waitFor();
  report.passed.push('Refresh loads safely; form and results fit 320, 375, 768, 1280 and 1440px; PolicyPlanner never receives CRM bearer token');
  assert.ok(report.calls.filter(call=>call.path.endsWith('/save-step') && call.body.step===2).every(call=>call.body.section==='members'));
  assert.deepEqual(report.pageErrors,[]);
  for (const call of report.calls.filter(call=>call.path.includes('/insurance/'))) assert.equal(call.authorization,'Bearer insurance-test-token');
  console.log(report.passed.join('\n'));
} finally {
  await mkdir('.insurance-validation',{recursive:true});
  await writeFile('.insurance-validation/browser-report.json',JSON.stringify(report,null,2));
  await browser?.close();
  await server.close();
}
