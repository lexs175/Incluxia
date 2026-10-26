import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile,stat,mkdir,writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve,extname,sep } from 'node:path';
import assert from 'node:assert/strict';

const root=resolve('dist'),out=resolve('artifacts/radius');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(path!==root&&!path.startsWith(root+sep))throw Error('Path');if((await stat(path)).isDirectory())path=resolve(path,'index.html');res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(await readFile(path));}
  catch{res.writeHead(404);res.end();}
});
await mkdir(out,{recursive:true});await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base='http://127.0.0.1:'+server.address().port;
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const finalOnly=process.argv.includes('--final');
const report={checks:[],errors:[]};let browser;
try{
  browser=await chromium.launch({headless:true,executablePath});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  async function go(path){const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response.status(),200,path);await page.evaluate(()=>document.fonts.ready);}
  async function inspect(label){
    const result=await page.evaluate(()=>{
      const unexpected=[],nonCircular=[],buttons=[];let inspected=0;
      for(const el of document.querySelectorAll('*')){
        if(!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
        const style=getComputedStyle(el),rect=el.getBoundingClientRect();if(!rect.width||!rect.height)continue;
        const radii=[style.borderTopLeftRadius,style.borderTopRightRadius,style.borderBottomRightRadius,style.borderBottomLeftRadius];
        const name=el.tagName.toLowerCase()+(el.id?'#'+el.id:'.'+[...el.classList].slice(0,2).join('.'));
        if(radii.some(radius=>!['0px','8px','9999px'].includes(radius)))unexpected.push({name,radii});
        if(radii.includes('9999px')&&Math.abs(rect.width-rect.height)>1)nonCircular.push({name,width:rect.width,height:rect.height});
        if(radii.some(radius=>radius!=='0px'))inspected++;
        if(el.matches('.btn-text-capsule,.btn-badge-inner'))buttons.push({name,radii});
      }
      return {inspected,unexpected,nonCircular,buttons,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    report.checks.push({label,width:page.viewportSize().width,...result});
    assert.deepEqual(result.unexpected,[],label+' has unexpected radius');assert.deepEqual(result.nonCircular,[],label+' has non-circular pills');
    assert(result.buttons.every(button=>button.radii.every(radius=>radius==='8px')),label+' button pieces share 8px');assert(!result.overflow,label+' overflow');
  }
  const guest=['/','/casos-de-exito','/casos-de-exito/luis-programador-santa-cruz','/blog','/blog/que-es-la-hipoacusia-sintomas-causas-mitos','/nosotros'];
  for(const width of finalOnly?[]:[1440,390]){
    await page.setViewportSize({width,height:1000});
    for(const path of guest){await go(path);await inspect('guest '+path);}
    await go('/');
    if(width===390){await page.locator('#mobileMenuBtn').click();await page.locator('#mobileGuestBox [data-auth-trigger=login]').click();}
    else await page.locator('#btnHeaderLogin').click();
    await page.locator('.auth-modal-capsule').waitFor({state:'visible'});await inspect('login modal');
    await page.screenshot({path:resolve(out,'login-'+width+'.png')});await page.locator('#authCloseBtn').click();
  }
  console.log('PASS Public pages and login modal at desktop/mobile widths.');
  await page.setViewportSize({width:1440,height:1000});await go('/');await page.locator('#btnHeaderLogin').click();await page.locator('#btnDemoCandidate').click();await page.locator('.member-home').waitFor({state:'visible'});
  const member=['/','/contratar','/contratar/diseno-grafico','/publicar','/publicar?tab=mine','/postulaciones?tab=sent','/postulaciones?tab=received','/perfil','/empleos/asistente-gestion-documental-archivo'];
  for(const width of finalOnly?[390]:[1440,390]){
    await page.setViewportSize({width,height:1000});
    for(const path of finalOnly?[]:member){
      await go(path);await inspect('member '+path);
      if(['/', '/contratar','/publicar','/postulaciones?tab=sent'].includes(path))await page.screenshot({path:resolve(out,(path==='/'?'inicio':path.split('?')[0].slice(1))+'-'+width+'.png')});
    }
    await go('/publicar');
    if(width===1440)await page.locator('.nav-desktop details').filter({hasText:'Publicar'}).locator('summary').hover();
    else{await page.locator('#mobileMenuBtn').click();await page.locator('.nav-mobile details').filter({hasText:'Publicar'}).locator('summary').click();}
    await inspect('navigation dropdown');
    await page.screenshot({path:resolve(out,'dropdown-'+width+'.png')});
    await go('/contratar/diseno-grafico');
    await page.locator('.autonomo-name').first().click();await page.locator('#hiringSideDrawer.is-open').waitFor({state:'visible'});await inspect('hiring detail drawer');
  }
  console.log('PASS Member pages, dropdowns, button pieces and hiring drawers at desktop/mobile widths.');
  assert.deepEqual(report.errors,[]);console.log('PASS No JavaScript errors; avatars and circular controls preserved.');
}finally{await writeFile(resolve(out,finalOnly?'verification-final.json':'verification.json'),JSON.stringify(report,null,2));await browser?.close();await new Promise(done=>server.close(done));}
