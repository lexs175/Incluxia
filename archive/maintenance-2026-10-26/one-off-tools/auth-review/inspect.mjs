import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
const stage = process.argv[2] || 'before';
const root = resolve('dist'), out = resolve('artifacts/auth-review');
await mkdir(out, { recursive: true });
const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.webp':'image/webp', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg' };
const server = createServer(async (req,res) => {
  try {
    let p = resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://local').pathname));
    if (p !== root && !p.startsWith(root + sep)) throw Error('Invalid path');
    if ((await stat(p)).isDirectory()) p = resolve(p,'index.html');
    res.writeHead(200, {'Content-Type':types[extname(p)] || 'application/octet-stream'});res.end(await readFile(p));
  } catch {res.writeHead(404);res.end();}
});
await new Promise(r => server.listen(0,'127.0.0.1',r));
const url = `http://127.0.0.1:${server.address().port}`;
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({headless:true,executablePath});
const report = {stage, screens:[], errors:[]};
try {
  for (const [width,height] of [[1440,1000],[390,844],[1024,600],[240,720]]) {
    const context = await browser.newContext({viewport:{width,height}, reducedMotion:'reduce'});
    const page = await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    await page.goto(url,{waitUntil:'networkidle'});
    await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo({top:1400,behavior:'instant'});});
    const scrollBefore = await page.evaluate(()=>scrollY);
    let trigger = page.locator('.header-actions [data-auth-trigger="register"]:visible');
    if (!await trigger.count()) {
      await page.locator('#mobileMenuBtn').click();
      trigger = page.locator('#mobileDrawer [data-auth-trigger="register"]:visible');
    }
    await trigger.first().click();await page.waitForTimeout(150);
    const scrollOpen = await page.evaluate(()=>scrollY);
    const metrics = await page.locator('#authModalWrapper').evaluate(wrapper => {
      const capsule=wrapper.querySelector('.auth-modal-capsule'), r=capsule.getBoundingClientRect();
      const heading=document.getElementById(wrapper.getAttribute('aria-labelledby'));
      return {top:r.top,bottom:r.bottom,height:r.height,viewport:innerHeight, horizontalOverflow:capsule.scrollWidth>capsule.clientWidth+1,
        labelVisible:!!heading && heading.getBoundingClientRect().height>0,
        active:document.activeElement?.id,smallControls:[...wrapper.querySelectorAll('button')].filter(el=>el.getBoundingClientRect().height>0&&el.getBoundingClientRect().height<44).map(el=>el.id||el.textContent.trim())};
    });
    if (stage === 'final') {
      assert.equal(scrollOpen, scrollBefore, `Opening scroll at ${width}`);
      assert.equal(metrics.labelVisible,true);
      assert.equal(metrics.horizontalOverflow,false);
      assert.deepEqual(metrics.smallControls,[]);
      await page.locator('#btnRegisterSubmit').scrollIntoViewIfNeeded();
      const button=await page.locator('#btnRegisterSubmit').boundingBox();
      assert.ok(button.y>=0&&button.y+button.height<=height, `Submit reachable at ${width}`);
      assert.equal(await page.evaluate(()=>scrollY),scrollBefore);
      await page.locator('.auth-modal-capsule').evaluate(el=>el.scrollTop=0);
    }
    if (width>=390) await page.screenshot({path:`${out}/${stage}-register-${width}.png`});
    await page.locator('#tabLoginBtn').click();
    await page.waitForTimeout(200);
    if (width===1440||width===390) await page.screenshot({path:`${out}/${stage}-login-${width}.png`});
    await page.keyboard.press('Escape');
    const scrollClosed=await page.evaluate(()=>scrollY);
    if (stage === 'final') assert.equal(scrollClosed,scrollBefore,`Closing scroll at ${width}`);
    report.screens.push({width,height,scrollBefore,scrollOpen,scrollClosed,...metrics});
    await context.close();
  }
  if (stage === 'final') {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await context.newPage(); page.on('pageerror',e=>report.errors.push(e.message));
    async function open(mode='register') {
      let trigger=page.locator(`.header-actions [data-auth-trigger="${mode}"]:visible`);
      if (!await trigger.count()) {await page.locator('#mobileMenuBtn').click();trigger=page.locator(`#mobileDrawer [data-auth-trigger="${mode}"]:visible`);}
      await trigger.first().click();
    }
    async function fill({email='prueba-auth@ejemplo.test',phone='70000987'}={}) {
      await page.locator('#regFullName').fill('Ángela Nuñez');
      await page.locator('#regWhatsApp').fill(phone);
      await page.locator('#regEmail').fill(email);
      await page.locator('#regPassword').fill('prueba');
    }
    async function logout() {
      if (await page.locator('#headerAccountTrigger').isVisible()) {
        await page.locator('#headerAccountTrigger').click();
        await page.locator('#btnHeaderLogout').click();
      } else {
        await page.locator('#mobileMenuBtn').click();
        await page.locator('#btnMobileLogout').click();
      }
      await page.locator('.ashico-hero').waitFor({state:'visible'});
    }
    await page.goto(url+'/casos-de-exito?from=auth',{waitUntil:'networkidle'});
    await open();
    assert.equal(await page.evaluate(()=>document.querySelector('main').inert),true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'btnRegisterSubmit');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'tabRegisterBtn');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#tabLoginBtn').getAttribute('aria-selected'),'true');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#tabRegisterBtn').getAttribute('aria-selected'),'true');
    await page.locator('#btnRegisterSubmit').click();
    assert.equal(await page.locator('#registerForm [aria-invalid="true"]').count(),4);
    assert.equal(await page.locator('#regFullNameError').isVisible(),true);
    await fill({phone:'123',email:'sin-correo'});
    await page.locator('#regPassword').fill('12');
    await page.locator('#btnRegisterSubmit').click();
    assert.equal(await page.locator('#registerForm [aria-invalid="true"]').count(),3);
    await fill({phone:'70000001'});
    await page.locator('#btnRegisterSubmit').click();
    assert.match(await page.locator('#regWhatsAppError').textContent(),/ya tiene una cuenta/);
    await fill({email:'valeria@ejemplo.test'});
    await page.locator('#btnRegisterSubmit').click();
    assert.match(await page.locator('#regEmailError').textContent(),/ya tiene una cuenta/);
    assert.equal(await page.locator('#regFullName').inputValue(),'Ángela Nuñez');
    await page.screenshot({path:`${out}/final-error-390.png`});
    await fill();
    await page.locator('#btnRegisterSubmit').click();
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(()=>document.documentElement.dataset.session==='member');
    assert.equal(new URL(page.url()).pathname,'/casos-de-exito');
    assert.equal(new URL(page.url()).search,'?from=auth');
    const account=await page.evaluate(()=>{
      const state=JSON.parse(localStorage.getItem('incluxia_demo_v1'));
      return state.accounts.find(a=>a.id===state.sessionId);
    });
    assert.equal(account.phone,'59170000987');
    assert.equal(account.name,'Ángela Nuñez');
    await logout();
    await open('login');
    await page.locator('#loginIdentifier').fill('nadie@ejemplo.test');
    await page.locator('#loginPassword').fill('prueba');
    await page.locator('#btnLoginSubmit').click();
    assert.match(await page.locator('#loginIdentifierError').textContent(),/No encontramos esa cuenta/);
    await page.locator('#btnForgotPassword').click();
    assert.equal(await page.locator('#authAlert').getAttribute('role'),'status');
    await page.locator('#toggleLoginPass').click();
    assert.equal(await page.locator('#loginPassword').getAttribute('type'),'text');
    assert.equal(await page.locator('#toggleLoginPass').getAttribute('aria-pressed'),'true');
    await page.locator('#loginIdentifier').fill('70000987');
    await page.locator('#btnLoginSubmit').click();
    await page.waitForFunction(()=>document.documentElement.dataset.session==='member');
    await page.waitForLoadState('networkidle');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).sessionId),account.id);
    await logout();
    await page.goto(url+'/empleos/oferta?id=job-2',{waitUntil:'networkidle'});
    await page.locator('.access-gate [data-auth-trigger="login"]').click();
    await page.locator('#loginIdentifier').fill('valeria@ejemplo.test');
    await page.locator('#loginPassword').fill('1234');
    await page.locator('#btnLoginSubmit').click();
    await page.waitForLoadState('networkidle');
    assert.equal(new URL(page.url()).searchParams.get('id'),'job-2');
    await logout();
    await open('login');
    await page.locator('#btnDemoCandidate').click();
    await page.waitForFunction(()=>document.documentElement.dataset.session==='member');
    await page.waitForLoadState('networkidle');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).sessionId),'demo-valeria');
    report.functional=['scroll unchanged','keyboard tabs and focus trap','background inert','empty and invalid inputs','duplicate email and local/international phone','registration and preserved destination','unknown account','informational PIN help','PIN toggle','login with local phone','offer query preserved','example account'];
    await context.close();
    const legacy=await browser.newContext({reducedMotion:'reduce'});
    await legacy.addInitScript(()=>localStorage.setItem('incluxia_auth_user',JSON.stringify({name:'Cuenta anterior',email:'anterior@ejemplo.test',phone:'59170000888',city:'La Paz'})));
    const legacyPage=await legacy.newPage();
    await legacyPage.goto(url,{waitUntil:'networkidle'});
    assert.equal(await legacyPage.locator('#headerProfileName').textContent(),'Cuenta');
    await legacy.close();
    report.functional.push('legacy session migration');
    assert.deepEqual(report.errors,[]);
  }
  await writeFile(`${out}/${stage}.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
} finally {await browser.close();await new Promise(r=>server.close(r));}
