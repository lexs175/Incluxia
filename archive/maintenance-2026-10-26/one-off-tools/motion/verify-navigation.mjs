import {chromium,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist'),out=resolve('artifacts/motion'),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
await mkdir(out,{recursive:true});const server=createServer(async(req,res)=>{try{let file=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(file!==root&&!file.startsWith(root+sep))throw Error('path');if((await stat(file)).isDirectory())file=resolve(file,'index.html');res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port,report={checks:[],errors:[]};let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)});
 for(const fallback of [false,true]){
  const context=await browser.newContext({viewport:{width:1728,height:966},reducedMotion:'no-preference'});
  if(fallback)await context.addInitScript(()=>Object.defineProperty(Document.prototype,'startViewTransition',{value:undefined,configurable:true}));
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle'});await page.locator('#btnHeaderLogin').click();await page.locator('#btnDemoCandidate').click();await page.locator('.member-home').waitFor();await page.waitForLoadState('networkidle');
  const instrument=()=>{
   window.__documentMarker=crypto.randomUUID();window.__swaps=[];
   document.addEventListener('astro:after-swap',()=>window.__swaps.push(document.documentElement.dataset.session));
   window.__startTrace=()=>{
    const trace={frames:[],marker:window.__documentMarker};window.__trace=trace;
    const until=performance.now()+600;
    function frame(){
     const rect=selector=>{const element=document.querySelector(selector),r=element?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height,transform:getComputedStyle(element).transform}:null;};
     const animations=document.getAnimations().filter(animation=>animation.playState==='running'&&(animation.effect?.pseudoElement?.includes('view-transition')||animation.effect?.target?.matches?.('html,body,.header,.navbar-capsule'))).map(animation=>({name:animation.animationName||animation.transitionProperty,pseudo:animation.effect?.pseudoElement,frames:animation.effect?.getKeyframes()}));
     trace.frames.push({session:document.documentElement.dataset.session,clientWidth:document.documentElement.clientWidth,header:rect('.navbar-capsule'),logo:rect('.app-brand'),nav:innerWidth>1024?rect('.nav-list'):null,animations});
     if(performance.now()<until)requestAnimationFrame(frame);else trace.done=true;
    }frame();
   };
  };
  await page.evaluate(instrument);
  async function trace(label,action){
   await page.evaluate(()=>window.__startTrace());await action();await page.waitForFunction(()=>window.__trace?.done);
   const trace=await page.evaluate(()=>({trace:window.__trace,marker:window.__documentMarker,swaps:window.__swaps}));
   assert.equal(trace.marker,trace.trace.marker,'SPA navigation stays active');assert(trace.swaps.every(session=>session==='member'),'session preserved at every swap');
   const frames=trace.trace.frames;
   assert(frames.every(frame=>frame.session==='member'),'no guest frame '+label);
   assert(frames.every(frame=>frame.animations.length===0),'no shell animation '+label);
   assert.equal(new Set(frames.map(frame=>frame.clientWidth)).size,1,'no width shift '+label);
   for(const part of ['header','logo','nav']){
    const positions=frames.map(frame=>frame[part]).filter(Boolean);if(!positions.length)continue;
    for(const property of ['x','y','width','height'])assert(Math.max(...positions.map(position=>position[property]))-Math.min(...positions.map(position=>position[property]))<0.1,part+' '+property+' stable '+label);
    assert(positions.every(position=>position.transform==='none'),'no transform '+part);
   }
   report.checks.push({fallback,width:page.viewportSize().width,label,frames:frames.length,shellAnimations:0,session:'member'});
  }
  async function link(href){const locator=page.locator('.nav-desktop a[href="'+href+'"]:visible');await locator.click();await page.waitForURL(base+href);}
  async function dropdown(label,href,mobile=false){
   if(mobile)await page.locator('#mobileMenuBtn').click();
   const menu=page.locator(mobile?'.nav-mobile details':'.nav-desktop details').filter({hasText:label});
   if(mobile)await menu.locator('summary').click();else await menu.locator('summary').hover();
   await menu.locator('a[href="'+href+'"]').click();await page.waitForURL(base+href);
  }
  await trace('Inicio → Contratar',()=>link('/contratar'));
  await trace('Abrir categoría',async()=>{await page.locator('.category-rubro-card a').first().click();await page.locator('.hiring-explorer-wrapper[data-ready=true]').waitFor();});
  await trace('Cambiar rubro',async()=>{await page.locator('.category-filter-item[href="/contratar/redes-sociales"]').click();await page.waitForURL(base+'/contratar/redes-sociales');});
  await trace('Filtrar ciudad',()=>page.locator('.city-chip[data-city="La Paz"]').click());
  await trace('Cambiar a servicios',()=>page.locator('#toggleServicesBtn').click());
  await trace('Buscar sin resultados',()=>page.locator('#explorerSearchInput').fill('ningun-resultado-xyz'));
  await trace('Restablecer filtros',()=>page.locator('#resetHiringFilters').click());
  await trace('Abrir Publicar',()=>dropdown('Publicar','/publicar'));
  await trace('Mis publicaciones',()=>dropdown('Publicar','/publicar?tab=mine'));
  await trace('Postulaciones recibidas',()=>dropdown('Postulaciones','/postulaciones?tab=received'));
  await trace('Ver perfil',()=>link('/perfil'));
  await trace('Volver a Inicio',()=>link('/'));
  await trace('Filtros de trabajo',()=>page.locator('#toggleJobFilters').click());
  await trace('Buscar trabajo',()=>page.locator('#jobSearch').fill('sin-resultados-xyz'));
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/publicar',{waitUntil:'networkidle'});
  await page.evaluate(instrument);
  await trace('Mobile navigation',()=>dropdown('Postulaciones','/postulaciones?tab=received',true));await expect(page.locator('.account-heading h1')).toHaveText('Postulaciones recibidas');
  await trace('Mobile Contratar',async()=>{await page.locator('#mobileMenuBtn').click();await page.locator('.nav-mobile a[href="/contratar"]:visible').click();await page.waitForURL(base+'/contratar');});
  await trace('Mobile category',async()=>{await page.locator('.category-rubro-card a').first().click();await page.locator('.hiring-explorer-wrapper[data-ready=true]').waitFor();});
  await trace('Mobile mode',()=>page.locator('#mobileToggleServicesBtn').click());
  await trace('Mobile search',()=>page.locator('#explorerSearchInput').fill('ningun-resultado-xyz'));
  assert.equal(await page.locator('.header').evaluate(element=>getComputedStyle(element).transitionProperty),'none');
  assert.equal(await page.locator('.navbar-capsule').evaluate(element=>getComputedStyle(element).transitionProperty),'none');
  assert(await page.evaluate(()=>window.__swaps.every(session=>session==='member')));
  await page.screenshot({path:resolve(out,fallback?'mobile-fallback.png':'mobile-native.png')});
  report.checks.push({fallback,width:390,label:'Mobile route, dropdown and session preserved'});
  await context.close();console.log('PASS '+(fallback?'fallback':'native')+': member routes, category/filter changes and mobile menu; no page animation or navbar movement.');
 }
 assert.deepEqual(report.errors,[]);console.log('PASS No JavaScript errors.');
}finally{await writeFile(resolve(out,'navigation-verification.json'),JSON.stringify(report,null,2));await browser?.close();await new Promise(done=>server.close(done));}
