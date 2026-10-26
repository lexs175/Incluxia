import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist'), out=resolve('artifacts/header-interaction');
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try{let p=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(p!==root&&!p.startsWith(root+sep))throw Error('Invalid path');if((await stat(p)).isDirectory())p=resolve(p,'index.html');res.writeHead(200,{'Content-Type':types[extname(p)]||'application/octet-stream'});res.end(await readFile(p));}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}`;
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath});
const report={checks:[],mobile:[],errors:[]};
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(url,{waitUntil:'networkidle'});
  await page.locator('#btnHeaderLogin').click();await page.locator('#btnDemoCandidate').click();
  await page.waitForLoadState('networkidle');
  await page.locator('#headerAccountTrigger').waitFor({state:'visible'});
  const fixture=await page.evaluate(()=>localStorage.getItem('incluxia_demo_v1'));
  const account=page.locator('#headerProfileWrapper'), trigger=page.locator('#headerAccountTrigger');
  await trigger.hover();
  await page.waitForFunction(()=>document.getElementById('headerProfileWrapper').open);
  const firstBox=await trigger.boundingBox(), linkBox=await page.locator('#headerProfileLink').boundingBox();
  await page.mouse.move(linkBox.x+linkBox.width/2,firstBox.y+firstBox.height+4);
  await page.waitForTimeout(200);
  assert.equal(await account.evaluate(el=>el.open),true,'Pointer bridge keeps the popup open');
  await page.locator('#headerProfileLink').hover();
  assert.equal(await account.evaluate(el=>el.open),true);
  await page.screenshot({path:out+'/desktop-hover.png',clip:{x:0,y:0,width:1440,height:290}});
  await page.mouse.move(700,300);await page.waitForTimeout(220);
  assert.equal(await account.evaluate(el=>el.open),false);
  report.checks.push('Account opens on hover, stays open across the gap and closes on exit');
  await trigger.focus();await page.keyboard.press('Enter');
  assert.equal(await account.evaluate(el=>el.open),true);
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'headerProfileLink');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'btnHeaderLogout');
  await page.keyboard.press('Escape');
  assert.equal(await account.evaluate(el=>el.open),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'headerAccountTrigger');
  await page.locator('.brand').focus();
  await trigger.hover();
  await page.locator('.nav-desktop summary').first().hover();
  await page.waitForTimeout(200);
  assert.equal(await account.evaluate(el=>el.open),false);
  report.checks.push('Keyboard navigation, Escape and exclusive dropdowns');
  await page.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem('incluxia_demo_v1')),a=s.accounts.find(a=>a.id===s.sessionId);a.name='Andrea Actualizada';localStorage.setItem('incluxia_demo_v1',JSON.stringify(s));window.dispatchEvent(new CustomEvent('incluxia:auth-changed',{detail:a}));
  });
  assert.equal(await page.locator('#headerProfileName').textContent(),'Andrea');
  report.checks.push('Header identity updates with the actual account event');
  await context.close();

  for(const width of [768,390,320,240]){
    const mobile=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
    const state=JSON.parse(fixture);
    if(width===320){const a=state.accounts.find(a=>a.id===state.sessionId);a.name='María del Carmen Fernández de la Comunidad';a.photo='';}
    await mobile.addInitScript(value=>{if(!localStorage.getItem('incluxia_demo_v1'))localStorage.setItem('incluxia_demo_v1',value);},JSON.stringify(state));
    const p=await mobile.newPage();p.on('pageerror',e=>report.errors.push(e.message));
    await p.goto(url,{waitUntil:'networkidle'});
    await p.evaluate(()=>window.scrollTo({top:500,behavior:'instant'}));
    const before=await p.evaluate(()=>scrollY);
    await p.locator('#mobileMenuBtn').tap();
    assert.equal(await p.locator('#mobileMenuBtn').getAttribute('aria-expanded'),'true');
    assert.equal(await p.locator('main').evaluate(el=>el.inert),true);
    assert.equal(await p.locator('.mobile-nav-scroll #mobileAccountLink').count(),0);
    assert.equal(await p.locator('#mobileAccountLink:visible').count(),1);
    assert.equal(await p.locator('.header [data-account-avatar]:visible').count(),1);
    assert.equal(await p.locator('#mobileAccountLink').evaluate(el=>el.parentElement.classList.contains('mobile-menu-footer')),true);
    const metrics=await p.locator('.mobile-menu-footer').evaluate(el=>{
      const box=el.getBoundingClientRect(),profile=el.querySelector('a').getBoundingClientRect(),logout=el.querySelector('button').getBoundingClientRect();return {width:innerWidth,footerTop:box.top,footerBottom:box.bottom,profileHeight:profile.height,logoutHeight:logout.height,sameRow:Math.abs(profile.y+profile.height/2-logout.y-logout.height/2)<3,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.equal(metrics.overflow,false);assert.ok(metrics.footerBottom<=845);assert.ok(metrics.footerTop>500);assert.ok(metrics.profileHeight>=44);assert.ok(metrics.logoutHeight>=44);
    if(width>=360)assert.equal(metrics.sameRow,true);
    if(width===320){assert.equal(await p.locator('#mobileAccountLink [data-account-initial]').textContent(),'M');assert.equal(await p.locator('#mobileAccountLink img').isVisible(),false);}
    await p.screenshot({path:`${out}/mobile-${width}.png`});
    await p.locator('.mobile-nav-dropdown summary').first().tap();
    assert.equal(await p.locator('.mobile-nav-dropdown').first().evaluate(el=>el.open),true);
    await p.keyboard.press('Escape');await p.keyboard.press('Escape');
    assert.equal(await p.locator('#mobileMenuBtn').getAttribute('aria-expanded'),'false');
    assert.equal(await p.evaluate(()=>scrollY),before);
    await p.locator('#mobileMenuBtn').tap();await p.locator('#mobileAccountLink').tap();
    await p.waitForURL('**/perfil');await p.waitForLoadState('networkidle');
    assert.equal(await p.locator('#mobileMenuBtn').getAttribute('aria-expanded'),'false');
    await p.locator('#mobileMenuBtn').tap();await p.locator('#btnMobileLogout').tap();
    await p.locator('.ashico-hero').waitFor({state:'visible'});await p.waitForLoadState('networkidle');
    assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).sessionId),null);
    report.mobile.push(metrics);await mobile.close();
  }
  report.checks.push('Mobile footer, one identity, long names, avatar fallback, profile navigation and logout','Touch dropdowns, Escape, scroll preservation and background lock');
  const touch=await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true,reducedMotion:'reduce'});
  await touch.addInitScript(value=>localStorage.setItem('incluxia_demo_v1',value),fixture);
  const t=await touch.newPage();await t.goto(url,{waitUntil:'networkidle'});
  await t.locator('#headerAccountTrigger').tap();assert.equal(await t.locator('#headerProfileWrapper').evaluate(el=>el.open),true);
  await t.locator('#headerAccountTrigger').tap();assert.equal(await t.locator('#headerProfileWrapper').evaluate(el=>el.open),false);
  await touch.close();report.checks.push('Touch fallback on a wide screen');
  assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report));
}catch(error){report.failure=error.stack;process.exitCode=1;console.error(error);}
finally{await writeFile(out+'/verification.json',JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
