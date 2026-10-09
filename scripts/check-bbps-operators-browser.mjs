import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';
import { normalizeBbpsOperatorDetails } from '../src/api/bbpsOperatorDetails.ts';

const field = {param_name:'utility_acc_no',param_label:'Vehicle Number',param_id:'1',param_type:'AlphaNumeric',regex:'^[a-zA-Z0-9]{7,10}$',error_message:'Please Enter Valid Vehicle Number (eg. MH01AB5678)',logo_url:null,logo_alt:null};
const details = {operator_name:'IDFC FIRST Bank - FasTag',data:[field],operator_id:433,fetchBill:1,BBPS:1};
assert.deepEqual(normalizeBbpsOperatorDetails(details,433).data,[field]);
assert.equal(normalizeBbpsOperatorDetails(details,433).operator_name,details.operator_name);
assert.equal(normalizeBbpsOperatorDetails({data:{...details,fetchBill:0,BBPS:0}},433).fetchBill,0);
assert.equal(normalizeBbpsOperatorDetails({...details,fetchBill:'0',BBPS:'0'},433).BBPS,0);
assert.equal(normalizeBbpsOperatorDetails({data:[null,{param_label:'Invalid field'}]},433).data.length,0);

const entryId='\0bbps-operator-check';
const server=await createServer({
  configLoader:'native', cacheDir:'.bbps-validation/vite-cache',
  server:{host:'127.0.0.1',port:0,strictPort:false,open:false},
  plugins:[{
    name:'bbps-operator-check',enforce:'pre',
    resolveId(id){if(id==='virtual:bbps-operator-check')return entryId;},
    load(id){if(id===entryId)return `
      import React, {useEffect,useState} from 'react';
      import {createRoot} from 'react-dom/client';
      import Directory from '/src/modules/bbps/components/BbpsBillerDirectory.tsx';
      import Form from '/src/modules/bbps/components/BbpsDynamicFormModal.tsx';
      import Plans from '/src/modules/bbps/components/BbpsRechargePlansModal.tsx';
      import {fetchBbpsOperators,fetchBbpsOperatorDetails,fetchBbpsRechargePlans} from '/src/api/bbpsApi.ts';
      import '/src/index.css';
      function Test(){
        const [ops,setOps]=useState([]),[category,setCategory]=useState(null),[operator,setOperator]=useState(null),[details,setDetails]=useState(null),[loading,setLoading]=useState(false);
        const [plans,setPlans]=useState(null),[mobile,setMobile]=useState('');
        useEffect(()=>{fetchBbpsOperators(category).then(setOps);},[category]);
        async function select(op){setOperator(op);setDetails(null);setLoading(true);try{setDetails(await fetchBbpsOperatorDetails(op.operator_id));}finally{setLoading(false);}}
        return React.createElement('main',{className:'p-4'},
          React.createElement(Directory,{categories:[{operator_category_id:8,operator_category_name:'Electricity'},{operator_category_id:22,operator_category_name:'FASTag'}],operators:ops,selectedCategory:category,onSelectCategory:setCategory,onSelectOperator:select,onSelectCircle:()=>{}}),
          operator?React.createElement(Form,{operator,operatorDetails:details,loadingDetails:loading,selectedCircle:'27',locations:[{operator_location_id:27,operator_location_name:'Maharashtra'}],onSelectCircle:()=>{},onOpenPlans:async({mobile,circleId})=>{setMobile(mobile);setPlans((await fetchBbpsRechargePlans({mobile,circleId,operatorId:operator.operator_id})).data);},onFetchBill:value=>{window.__bbpsSubmitted=value;},onClose:()=>setOperator(null)}):null,
          plans?React.createElement(Plans,{plansData:plans,mobile,operatorName:operator.name,onSelectPlan:()=>{},onClose:()=>setPlans(null)}):null);

      }
      createRoot(document.getElementById('root')).render(React.createElement(Test));`;
    },
    configureServer(vite){vite.middlewares.use(async(req,res,next)=>{
      if(req.url!=='/__bbps-check')return next();
      res.setHeader('Content-Type','text/html');
      res.end(await vite.transformIndexHtml(req.url,'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/@id/__x00__bbps-operator-check"></script></body></html>'));
    });},
  }],
});
let browser;
try{
  await server.listen();
  const origin='http://127.0.0.1:'+server.httpServer.address().port;
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const ops=[
    {operator_id:22,name:'BSES Rajdhani',operator_category:8,logo_url:'https://cdn.rewardplanners.com/public/bbps/operator-logos/22.png',logo_alt:'BSES Rajdhani'},
    {operator_id:433,name:'IDFC FIRST Bank - FasTag',operator_category:22,logo_url:'https://cdn.rewardplanners.com/public/bbps/operator-logos/433.png',logo_alt:'IDFC FASTag'},
    {operator_id:24,name:'Missing Logo Biller',operator_category:8,logo_url:null},
    {operator_id:55,name:'Broken Logo Biller',operator_category:8,logo_url:'https://cdn.rewardplanners.com/broken.png'},
    {operator_id:99,name:'Jio Prepaid',operator_category:5},
  ];
  const calls=[];
  await context.route('**/*',async route=>{
    const req=route.request(), url=new URL(req.url());
    if(url.origin===origin)return route.continue();
    if(url.pathname.endsWith('/bills/operators')){
      calls.push(url.search);
      const category=url.searchParams.get('category_id');
      return route.fulfill({json:{data:category?ops.filter(op=>String(op.operator_category)===category):ops}});
    }
    if(url.pathname.endsWith('/bills/operator/433'))return route.fulfill({json:details});
    if(url.pathname.endsWith('/bills/operator/99'))return route.fulfill({json:{operator_name:'Jio Prepaid',operator_id:99,data:[{param_name:'utility_acc_no',param_label:'Mobile Number',regex:'^[6-9][0-9]{9}$',param_type:'Numeric'}]}});
    if(url.pathname.endsWith('/bills/recharge/plans')){
      calls.push(url.search);
      return route.fulfill({json:{success:true,plans:[{planId:'test-plan',amount:299,validity:'28 days',description:'Test data pack'}]}});
    }
    if(url.hostname==='cdn.rewardplanners.com'){
      if(url.pathname.includes('broken'))return route.fulfill({status:404,body:''});
      return route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=','base64')});
    }
    return route.fulfill({status:204,body:''});
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.setDefaultTimeout(30000);
  await page.goto(origin+'/__bbps-check',{waitUntil:'domcontentloaded',timeout:60000});
  await page.getByRole('heading',{name:'BSES Rajdhani',exact:true}).waitFor();
  assert.equal(await page.getByRole('img',{name:'BSES Rajdhani',exact:true}).getAttribute('src'),ops[0].logo_url);
  assert.equal(await page.getByRole('img',{name:'Missing Logo Biller',exact:true}).innerText(),'ML');
  await page.getByRole('img',{name:'Broken Logo Biller',exact:true}).filter({hasText:'BL'}).waitFor();
  await page.getByRole('button',{name:'Electricity',exact:true}).click();
  await page.getByRole('heading',{name:'BSES Rajdhani',exact:true}).waitFor();
  await page.getByRole('heading',{name:'IDFC FIRST Bank - FasTag',exact:true}).waitFor({state:'hidden'});
  assert.ok(calls.includes('?category_id=8'));
  await page.getByRole('button',{name:'FASTag',exact:true}).click();
  await page.getByRole('heading',{name:'IDFC FIRST Bank - FasTag',exact:true}).click();
  const input=page.getByLabel('Vehicle Number',{exact:false});
  await input.waitFor();
  assert.equal(await page.getByPlaceholder('Enter consumer or account number').count(),0);
  assert.equal(await page.getByRole('img',{name:'IDFC FASTag',exact:true}).count(),2);
  await input.fill('??');
  await page.getByRole('button',{name:'Fetch Bill',exact:true}).click();
  await page.getByRole('alert').filter({hasText:field.error_message}).waitFor();
  assert.equal(await input.getAttribute('aria-invalid'),'true');
  await input.fill('mh01ab5678');
  assert.equal(await input.inputValue(),'MH01AB5678');
  await page.getByRole('button',{name:'Fetch Bill',exact:true}).click();
  const submitted=await page.evaluate(()=>window.__bbpsSubmitted);
  assert.equal(submitted.formValues.utility_acc_no,'MH01AB5678');
  for(const width of [320,375,768,1280]){
    await page.setViewportSize({width,height:900});
    assert.ok(await input.evaluate(el=>el.getBoundingClientRect().right<=innerWidth));
  }
  assert.deepEqual(errors,[]);
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.getByRole('button',{name:'All Billers',exact:true}).click();
  await page.getByRole('heading',{name:'Jio Prepaid',exact:true}).click();
  await page.getByLabel('Mobile Number',{exact:false}).fill('9876543210');
  await page.getByRole('button',{name:'Browse All Plans',exact:true}).click();
  await page.getByText('Showing best offers for 9876543210',{exact:true}).waitFor();
  await page.getByText('Test data pack',{exact:true}).waitFor();
  assert.ok(calls.some(search=>{const p=new URLSearchParams(search);return p.get('mobile')==='9876543210'&&p.get('operator_id')==='99'&&p.get('circle_id')==='27';}));
  console.log('Passed: operator metadata, logos/fallbacks, category filtering, FASTag validation, mobile form widths, entered recharge number in request/header, operator/circle parameters and flat plans response. No payments or live bill requests were made.');
}finally{await browser?.close();await server.close();}
