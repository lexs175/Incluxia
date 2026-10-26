import {chromium,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist'),out=resolve('artifacts/hiring-cards');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(path!==root&&!path.startsWith(root+sep))throw Error('Path');if((await stat(path)).isDirectory())path=resolve(path,'index.html');res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(await readFile(path));}catch{res.writeHead(404);res.end();}});
await mkdir(out,{recursive:true});await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port,report={checks:[],errors:[]};let browser;
const confirmOnly=process.argv.includes('--confirm');
try{
 const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
 browser=await chromium.launch({headless:true,executablePath});const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
 async function go(path){await page.goto(base+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);}
 async function mode(value){await page.locator('[data-mode-btn='+value+']:visible').first().click();}
 async function inspect(type,width){
  const selector=type==='autonomos'?'.autonomo-card-item':'.service-card-item';
  const result=await page.locator(selector).evaluateAll(cards=>cards.filter(card=>card.checkVisibility()).map(card=>{
   const rect=card.getBoundingClientRect(),styles=getComputedStyle(card),action=card.querySelector('.card-open-trigger'),button=action.getBoundingClientRect(),footer=card.querySelector('.autonomo-card-footer,.service-price-row');
   return {id:card.dataset.id,width:rect.width,height:rect.height,radius:styles.borderRadius,background:styles.backgroundColor,overflow:card.scrollWidth>card.clientWidth,actionInside:button.x>=rect.x&&button.right<=rect.right+1,actionInFooter:footer.contains(action),portfolios:card.querySelectorAll('.autonomo-portfolio-thumbnails').length,cover:card.querySelector('.service-cover-image')?.getAttribute('src')};
  }));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'page overflow '+width);
  assert(result.every(card=>card.radius==='8px'&&!card.overflow&&card.actionInside&&card.actionInFooter&&!card.portfolios),JSON.stringify(result));
  if(type==='servicios'){
   await page.locator('.service-cover-image').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode();})));
   assert(result.every(card=>card.cover),type+' cover');
  }
  report.checks.push({width,type,cards:result});
  if(type==='autonomos'){
   const contrasts=await page.locator('.skill-chip:visible').evaluateAll(chips=>chips.map(chip=>{
    const rgb=value=>value.match(/[\d.]+/g).map(Number),fg=rgb(getComputedStyle(chip).color),tint=rgb(getComputedStyle(chip).backgroundColor),base=rgb(getComputedStyle(chip.closest('article')).backgroundColor);
    const bg=tint.slice(0,3).map((channel,i)=>channel*(tint[3]??1)+base[i]*(1-(tint[3]??1)));
    const luminance=channels=>channels.map(channel=>{const value=channel/255;return value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4;}).reduce((total,value,index)=>total+value*[0.2126,0.7152,0.0722][index],0);
    return (Math.max(luminance(fg),luminance(bg))+0.05)/(Math.min(luminance(fg),luminance(bg))+0.05);
   }));
   assert(contrasts.every(contrast=>contrast>=4.5),'skill text contrast');
  }
 }
 await go('/');await page.locator('#btnHeaderLogin').click();await page.locator('#btnDemoCandidate').click();await page.locator('.member-home').waitFor({state:'visible'});
 for(const width of confirmOnly?[1440,390]:[1440,768,390,320,240]){
  await page.setViewportSize({width,height:1000});await go('/contratar/diseno-grafico');await page.locator('.hiring-explorer-wrapper[data-ready=true]').waitFor();
  await inspect('autonomos',width);
  if([1440,768,390].includes(width)){
   await page.screenshot({path:resolve(out,'autonomos-'+width+'.png'),fullPage:true});
   await page.locator('.autonomo-card-item').first().screenshot({path:resolve(out,'autonomo-card-'+width+'.png')});
  }
  const person=page.locator('.autonomo-card-item').first(),personId=await person.getAttribute('data-id');
  await person.locator('.card-open-trigger').focus();await page.keyboard.press('Enter');await expect(page.locator('#drawer-autonomo-'+personId)).toBeVisible();await page.locator('#hiringDrawerCloseBtn').click();
  await mode('servicios');await inspect('servicios',width);
  if([1440,768,390].includes(width)){
   await page.screenshot({path:resolve(out,'servicios-'+width+'.png'),fullPage:true});
   await page.locator('.service-card-item').first().screenshot({path:resolve(out,'service-card-'+width+'.png')});
  }
  const service=page.locator('.service-card-item').first(),serviceId=await service.getAttribute('data-id');await service.locator('.card-open-trigger').click();await expect(page.locator('#drawer-service-'+serviceId)).toBeVisible();await page.locator('#hiringDrawerCloseBtn').click();
 }
 console.log('PASS Both card designs at 1440, 768, 390, 320 and 240px; loaded covers, 8px corners, no overflow and working detail actions.');
 if(!confirmOnly){
 await page.setViewportSize({width:1440,height:1000});
 for(const slug of ['sistemas-ti','contabilidad-finanzas','digitacion-datos','redes-sociales','desarrollo-web','ilustracion-arte','edicion-video']){
  await go('/contratar/'+slug+'?mode=servicios');await inspect('servicios',1440);
  assert((await page.locator('.service-cover-image').first().getAttribute('src')).includes(slug));
 }
 await go('/contratar/diseno-grafico');await page.locator('#explorerSearchInput').fill('sin-coincidencia-qa-xyz');await expect(page.locator('#hiringEmpty')).toBeVisible();await page.locator('#resetHiringFilters').click();await expect(page.locator('.autonomo-card-item').first()).toBeVisible();
 await page.evaluate(()=>{
  const state=JSON.parse(localStorage.getItem('incluxia_demo_v1'));
  state.accounts.push({...state.accounts[0],id:'qa-person',name:'Persona sin fotografía de prueba',photo:'',profession:'Diseño editorial',category:'Diseño Gráfico',skills:'Edición, Diseño, Figma',portfolio:'',bio:'Diseño editorial y coordinación por escrito.'});
  state.publications.push({...state.publications.find(item=>item.type==='service'),id:'qa-service',ownerId:'qa-person',title:'Servicio de prueba sin fotografía de perfil',category:'Diseño Gráfico',company:'Persona sin fotografía de prueba',salary:'Bs. 900',delivery:'3 días'});
  localStorage.setItem('incluxia_demo_v1',JSON.stringify(state));
 });
 await page.reload({waitUntil:'networkidle'});const newPerson=page.locator('.autonomo-card-item[data-id=qa-person]');await expect(newPerson.locator('.card-open-trigger')).toBeVisible();assert.equal(await newPerson.locator('.pro-tag,.footer-meta-item').count(),0);await expect(newPerson.locator('.autonomo-initials')).toHaveText('Ps');
 await newPerson.locator('.card-open-trigger').click();await expect(page.locator('#drawer-autonomo-qa-person')).toBeVisible();await page.locator('#hiringDrawerCloseBtn').click();
 await mode('servicios');const newService=page.locator('.service-card-item[data-id=qa-service]');await expect(newService.locator('.service-author-avatar')).toBeHidden();assert.equal(await newService.locator('.service-cover-image').getAttribute('src'),'/images/categories/diseno-grafico.png');await newService.locator('.card-open-trigger').click();await expect(page.locator('#drawer-service-qa-service')).toBeVisible();
 console.log('PASS Category-specific images, search/reset, new profile/service templates and photo fallbacks.');
 }
 assert.deepEqual(report.errors,[]);console.log('PASS No JavaScript errors; skill text contrast meets 4.5:1.');
}finally{await writeFile(resolve(out,'verification.json'),JSON.stringify(report,null,2));await browser?.close();await new Promise(done=>server.close(done));}
