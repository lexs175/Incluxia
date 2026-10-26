import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const profiles=JSON.parse(fs.readFileSync('src/data/profiles.json','utf8'));
const hiring=JSON.parse(fs.readFileSync('src/data/hiring.json','utf8'));
assert.equal(profiles.length,19);
assert.equal(new Set(profiles.map(p=>p.cover)).size,19);
for(const p of profiles)assert.ok(fs.existsSync('src/assets/images/'+p.cover));
const root=path.resolve('dist'),out=path.resolve('artifacts/profile-covers');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=createServer((req,res)=>{
  try{
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
    if(file!==root&&!file.startsWith(root+path.sep))throw Error('Invalid path');
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(fs.readFileSync(file));
  }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={profiles:[],drawers:[],viewports:[],errors:[]};
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const valeria=profiles[0];
  await context.addInitScript(({valeria})=>{
    if(localStorage.getItem('incluxia_demo_v1'))return;
    localStorage.setItem('incluxia_demo_v1',JSON.stringify({version:1,exampleProfilesVersion:2,sessionId:'demo-valeria',accounts:[{id:'demo-valeria',name:valeria.name,email:'valeria@ejemplo.test',phone:'59170000001',city:valeria.city,profession:valeria.role,bio:valeria.about,skills:valeria.skills.join(', '),company:'',portfolio:'',cv:'',photo:valeria.photo,profileSlug:valeria.slug}],publications:[],applications:[],saved:{},inquiries:[]}));
  },{valeria});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  const go=async route=>{const response=await page.goto(url+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);};
  const loaded=async selector=>page.locator(selector).evaluate(async img=>{img.loading='eager';await img.decode();return{source:img.dataset.imageSource,loaded:img.complete&&img.naturalWidth>0,src:img.currentSrc,fit:getComputedStyle(img).objectFit,hidden:img.hidden};});
  for(const profile of profiles){
    await go('/perfiles/'+profile.slug);
    const image=await loaded('.profile-cover-image');
    assert.equal(image.source,profile.cover);assert.ok(image.loaded&&!image.hidden);assert.equal(image.fit,'cover');
    assert.ok(image.src.endsWith('.webp'));
    report.profiles.push({name:profile.name,cover:image.source});
  }
  await go('/contratar/todos?mode=autonomos');
  await page.waitForFunction(()=>document.querySelector('.hiring-explorer-wrapper')?.dataset.ready==='true');
  for(const autonomo of hiring.autonomos){
    const profile=profiles.find(p=>p.slug===autonomo.slug)||profiles.find(p=>p.name===autonomo.name);
    const id=autonomo.name===valeria.name?'demo-valeria':autonomo.id;
    const image=page.locator('#drawer-autonomo-'+id+' .drawer-cover-image');
    assert.equal(await image.getAttribute('data-image-source'),profile.cover);
    report.drawers.push({id,name:autonomo.name,cover:profile.cover});
  }
  for(const width of [1440,390,240]){
    await page.setViewportSize({width,height:1000});
    await page.locator('#autonomosList [data-id="aut-5"] .card-open-trigger').click();
    const panel=page.locator('#drawer-autonomo-aut-5');await panel.waitFor({state:'visible'});
    await page.waitForFunction(()=>Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.getElementById('hiringSideDrawer')).transform).m41)<0.1);
    const image=await loaded('#drawer-autonomo-aut-5 .drawer-cover-image');assert.equal(image.source,profiles.find(p=>p.slug==='camila-rojas-claure').cover);
    const pillData=await panel.locator('.drawer-meta-pill').evaluateAll(elements=>elements.map(el=>({text:el.textContent,icons:el.querySelectorAll('svg').length})));
    assert.equal(pillData.length,4);assert.ok(pillData.every(p=>p.icons===1));
    assert.ok(pillData.every(p=>!/[\p{Extended_Pictographic}\uFE0F]/u.test(p.text)));
    const close=page.locator('#hiringDrawerCloseBtn');
    assert.equal(await close.locator('path').getAttribute('d'),'M6 6l12 12M6 18 18 6');
    const bounds=await close.boundingBox();assert.ok(bounds.width>=44&&bounds.height>=44);
    const overflow=await page.locator('#hiringSideDrawer').evaluate(el=>el.scrollWidth>el.clientWidth+1);assert.equal(overflow,false);
    if(width!==240)await page.screenshot({path:path.join(out,'drawer-camila-'+width+'.png')});
    await close.click();await page.waitForFunction(()=>!document.getElementById('hiringSideDrawer').classList.contains('is-open'));
    report.viewports.push({width,loaded:image.loaded,svgIcons:4,closeSize:bounds.width});
  }
  await go('/perfiles/ver?id=talent-Camila%20Rojas%20Claure');
  await page.locator('#profileDetail[aria-busy="false"]').waitFor();
  assert.equal((await loaded('.profile-cover-image')).source,profiles.find(p=>p.slug==='camila-rojas-claure').cover);
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:path.join(out,'profile-camila-1440.png')});
  await go('/perfil');
  await page.locator('#profileDetail[aria-busy="false"]').waitFor();
  assert.equal((await loaded('.profile-cover-image')).source,valeria.cover);
  await page.evaluate(()=>{
    const state=JSON.parse(localStorage.getItem('incluxia_demo_v1'));
    state.accounts.push({id:'new-cover-test',name:'Persona nueva',email:'new@example.test',phone:'',city:'La Paz',profession:'Diseño',bio:'',skills:'Diseño',company:'',portfolio:'',cv:'',photo:''});
    state.sessionId='new-cover-test';localStorage.setItem('incluxia_demo_v1',JSON.stringify(state));
  });
  await go('/perfil');await page.locator('#profileDetail[aria-busy="false"]').waitFor();
  assert.equal(await page.locator('.profile-cover-image').isHidden(),true);
  await go('/contratar/todos?mode=autonomos');
  await page.locator('#drawer-autonomo-new-cover-test').waitFor({state:'attached'});
  assert.equal(await page.locator('#drawer-autonomo-new-cover-test .drawer-cover-image').getAttribute('src'),null);
  assert.deepEqual(report.errors,[]);
  console.log(JSON.stringify({profiles:report.profiles.length,drawers:report.drawers.length,viewports:report.viewports,dynamicAndOwn:true,newAccountFallback:true,errors:report.errors}));
}catch(error){report.failure=error.stack;console.error(error);process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
