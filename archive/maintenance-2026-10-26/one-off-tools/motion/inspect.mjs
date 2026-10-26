import {chromium} from '@playwright/test';import {createServer} from 'node:http';import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';import {existsSync} from 'node:fs';import {resolve,extname,sep} from 'node:path';
const root=resolve('dist'),out=resolve('artifacts/motion'),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
await mkdir(out,{recursive:true});const server=createServer(async(req,res)=>{try{let file=resolve(root,'.'+new URL(req.url,'http://local').pathname);if(file!==root&&!file.startsWith(root+sep))throw Error();if((await stat(file)).isDirectory())file=resolve(file,'index.html');res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});await new Promise(done=>server.listen(0,'127.0.0.1',done));const base='http://127.0.0.1:'+server.address().port;let browser;
try{
browser=await chromium.launch({headless:true,executablePath:['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync)});const context=await browser.newContext({viewport:{width:1728,height:966},reducedMotion:'no-preference'}),page=await context.newPage();
await page.goto(base,{waitUntil:'networkidle'});await page.locator('#btnHeaderLogin').click();await page.locator('#btnDemoCandidate').click();await page.locator('.member-home').waitFor();await page.waitForLoadState('networkidle');
await page.evaluate(()=>{
 window.__motion=[];
 window.__record=()=>{
  const start=performance.now(),samples=[];window.__motion.push(samples);
  function sample(){
   const header=document.querySelector('.navbar-capsule'),brand=document.querySelector('.brand'),main=document.querySelector('main'),rect=el=>{const r=el?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null;};
   samples.push({t:performance.now()-start,url:location.pathname,viewport:innerWidth,clientWidth:document.documentElement.clientWidth,header:rect(header),brand:rect(brand),main:rect(main),animations:document.getAnimations().map(animation=>({name:animation.animationName||animation.transitionProperty,pseudo:animation.effect?.pseudoElement,target:animation.effect?.target?.tagName,classes:animation.effect?.target?.getAttribute?.('class'),frames:animation.effect?.getKeyframes()}))});
   if(performance.now()-start<650)requestAnimationFrame(sample);
  }requestAnimationFrame(sample);
 };document.addEventListener('astro:after-swap',()=>window.__record());
});
await page.locator('.nav-desktop a[href="/contratar"]').click();await page.waitForTimeout(800);const navigation=await page.evaluate(()=>window.__motion);await page.locator('.category-rubro-card a').first().click();await page.locator('.hiring-explorer-wrapper[data-ready=true]').waitFor();await page.waitForTimeout(800);const category=await page.evaluate(()=>window.__motion);
await page.evaluate(()=>window.__record());await page.locator('.city-chip[data-city="La Paz"]').click();await page.waitForTimeout(800);const filters=await page.evaluate(()=>window.__motion.at(-1));
function summarize(samples){const frames=samples.flat(),animations=new Map();for(const frame of frames)for(const animation of frame.animations)animations.set(JSON.stringify(animation),animation);return {samples:frames.length,clientWidths:[...new Set(frames.map(frame=>frame.clientWidth))],headerPositions:[...new Set(frames.map(frame=>JSON.stringify(frame.header)))].map(JSON.parse),brandPositions:[...new Set(frames.map(frame=>JSON.stringify(frame.brand)))].map(JSON.parse),animations:[...animations.values()]};}
const report={navigation:summarize(navigation),category:summarize(category.slice(1)),filters:summarize(filters)};await writeFile(resolve(out,'inspection.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();await new Promise(done=>server.close(done));}
