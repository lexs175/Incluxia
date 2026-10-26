import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

const root=resolve('dist'),out=resolve('artifacts/publish-navigation');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  try {
    let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    if((await stat(path)).isDirectory())path=resolve(path,'index.html');
    res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(await readFile(path));
  } catch {res.writeHead(404);res.end('Not found');}
});
await mkdir(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
let browser;
const reports=[],errors=[];
const pass=value=>{reports.push(value);console.log('PASS',value);};
try {
  browser=await chromium.launch({headless:true,executablePath});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  async function go(path){await page.goto(base+path,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);}
  function menu(label,mobile=false){return page.locator(mobile?'.nav-mobile details':'.nav-desktop details').filter({has:page.locator('summary').filter({hasText:label})});}
  async function navigate(label,child){const dropdown=menu(label);await dropdown.locator('summary').hover();const link=dropdown.getByRole('link',{name:child,exact:true});const href=await link.getAttribute('href');await link.click();await page.waitForURL(base+href);await page.locator(label==='Postulaciones'?'#applicationsWorkspace[data-ready=true]':'#publishWorkspace[data-ready=true]').waitFor();}
  async function noOverflow(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');}
  await go('/');assert.equal(await page.locator('.nav-desktop .nav-link:visible').count(),2);
  await page.locator('#btnHeaderLogin').click();await page.locator('#btnDemoCandidate').click();
  await page.locator('.member-home').waitFor({state:'visible'});await page.waitForLoadState('networkidle');
  await navigate('Publicar','Crear publicación');
  await page.locator('#publishFormWrapper').waitFor({state:'visible'});
  assert.equal(await page.locator('#newPublicationTab,#myPublicationsTab').count(),0);
  assert.equal(await page.locator('[data-publication-kind]').count(),3);
  assert.equal(await page.locator('.publication-kind-options .modular-btn,.publication-kind-options svg').count(),0);
  pass('Invitado sin cambios; menú Publicar abre el formulario sin navegación duplicada ni flechas en selectores.');

  const dropdown=menu('Publicar');await dropdown.locator('summary').hover();
  assert(await dropdown.evaluate(el=>el.open));
  const summary=await dropdown.locator('summary').boundingBox();
  await page.mouse.move(summary.x+20,summary.y+summary.height+6);
  assert(await dropdown.evaluate(el=>el.open),'Pointer bridge remains open');
  await dropdown.getByRole('link',{name:'Mis publicaciones',exact:true}).hover();
  assert(await dropdown.evaluate(el=>el.open));
  await page.screenshot({path:resolve(out,'publicar-menu-desktop.png')});
  await page.locator('.publish-title').first().hover();assert.equal(await dropdown.evaluate(el=>el.open),false);
  await menu('Postulaciones').locator('summary').hover();assert(await menu('Postulaciones').evaluate(el=>el.open));
  await page.keyboard.press('Escape');assert.equal(await menu('Postulaciones').evaluate(el=>el.open),false);
  await menu('Postulaciones').locator('summary').focus();await page.keyboard.press('Enter');assert(await menu('Postulaciones').evaluate(el=>el.open));
  await page.keyboard.press('Escape');await page.locator('.publish-title').first().hover();
  pass('Ambos menús abren con hover; paso al submenú sin cierre; salida, Escape y teclado funcionan.');

  await page.locator('[data-publication-kind][value=company]').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#publicationKind').inputValue(),'person');
  assert.equal(await page.locator('#jobTypeToggle').isVisible(),false);
  await page.locator('.publication-kind-option[data-kind=service]').click();
  assert.equal(await page.locator('#publicationKind').inputValue(),'service');
  assert.match(await page.locator('#budgetLabelText').innerText(),/Precio del servicio/);
  await page.locator('.publication-kind-option[data-kind=company]').click();
  await page.locator('#jobTypeInput').selectOption('fixed');
  assert.match(await page.locator('#budgetLabelText').innerText(),/Sueldo mensual/);
  await page.screenshot({path:resolve(out,'publicar-desktop.png'),fullPage:true});
  pass('Selección por teclado y mouse; vacante, encargo y servicio conservan sus campos y cambios de presupuesto.');

  async function publish(kind,type='freelance'){
    await go('/publicar?kind='+kind);
    assert.equal(await page.locator('[data-publication-kind]:checked').inputValue(),kind);
    if(kind==='company')await page.locator('#jobTypeInput').selectOption(type);
    const title='QA '+kind+' '+type;
    await page.locator('#jobTitle').fill(title);await page.locator('#jobCategory').selectOption('Diseño Gráfico');
    await page.locator('#jobDelivery').fill('10 días');await page.locator('#jobBudget').fill('850');
    await page.locator('#jobDescription').fill('Diseñar un catálogo y coordinar por escrito.');
    await page.locator('#jobTasks').fill('Preparar propuesta\nEntregar archivos');
    await page.locator('#jobRequirements').fill('Experiencia en diseño');
    const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).publications.length);
    await page.locator('#btnSubmitPublish').click();await page.locator('#publicationPreview').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).publications.length),before);
    await page.locator('#editPublicationPreview').click();assert.equal(await page.locator('#jobTitle').inputValue(),title);
    await page.locator('#btnSubmitPublish').click();await page.locator('#confirmPublication').click();
    await page.locator('#publishSuccessBox').waitFor({state:'visible'});
    await page.locator('#viewMyPublished').click();assert.equal(new URL(page.url()).searchParams.get('tab'),'mine');
    assert.equal(await menu('Publicar').locator('a[aria-current=page]').getAttribute('href'),'/publicar?tab=mine');
    const item=page.locator('#publicationList .activity-item').filter({has:page.getByRole('heading',{name:title,exact:true})});
    assert.equal(await item.count(),1);return title;
  }
  const editTitle=await publish('company','fixed');await publish('company');await publish('person');await publish('service');
  let item=page.locator('#publicationList .activity-item').filter({has:page.getByRole('heading',{name:editTitle,exact:true})});
  await item.getByRole('button',{name:'Editar',exact:true}).click();
  assert.equal(await page.locator('#jobTypeInput').inputValue(),'fixed');
  await page.locator('#jobDelivery').fill('12 días');await page.locator('#btnSubmitPublish').click();await page.locator('#confirmPublication').click();await page.locator('#viewMyPublished').click();
  item=page.locator('#publicationList .activity-item').filter({has:page.getByRole('heading',{name:editTitle,exact:true})});
  assert.match(await item.innerText(),/12 días/);
  await item.getByRole('button',{name:'Pausar',exact:true}).click();assert.match(await item.innerText(),/Pausada/);
  await item.getByRole('button',{name:'Activar',exact:true}).click();await item.getByRole('button',{name:'Cerrar',exact:true}).click();assert.match(await item.innerText(),/Cerrada/);
  pass('Publicar las tres clases, proyecto y empleo; revisar, volver a editar, confirmar, administrar, pausar y cerrar.');
  await navigate('Publicar','Mis publicaciones');assert.equal(await page.locator('#publishFormWrapper').isVisible(),false);
  await navigate('Postulaciones','Recibidas');
  await expect(page.locator('.account-heading h1')).toHaveText('Postulaciones recibidas');
  assert.equal(await page.locator('#sentApplications,#receivedApplications').count(),0);
  await page.locator('[data-application-status]').first().selectOption('Seleccionada');
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-application-status]').first().inputValue(),'Seleccionada');
  await page.screenshot({path:resolve(out,'postulaciones-recibidas-desktop.png'),fullPage:true});
  await navigate('Postulaciones','Enviadas');await expect(page.locator('.account-heading h1')).toHaveText('Postulaciones enviadas');
  await page.locator('[data-withdraw]').click();assert.match(await page.locator('#applicationList').innerText(),/Retirada/);
  await go('/postulaciones?tab=received&job=job-catalogo');assert.equal(await page.locator('#applicationList .activity-item').count(),1);
  pass('Postulaciones enviadas y recibidas desde menú; estados, retirada y filtro por publicación conservados.');
  for(const width of [390,768]){
    await page.setViewportSize({width,height:900});await go('/publicar');await noOverflow();
    await page.locator('#mobileMenuBtn').click();await menu('Publicar',true).locator('summary').click();
    await menu('Publicar',true).getByRole('link',{name:'Mis publicaciones',exact:true}).click();
    await expect(page.locator('#myPublications')).toBeVisible();
    assert.equal(await page.locator('#mobileMenuBtn').getAttribute('aria-expanded'),'false');
    await page.locator('#mobileMenuBtn').click();await menu('Postulaciones',true).locator('summary').click();
    await page.screenshot({path:resolve(out,'menu-mobile-'+width+'.png')});
    await menu('Postulaciones',true).getByRole('link',{name:'Recibidas',exact:true}).click();
    await expect(page.locator('.account-heading h1')).toHaveText('Postulaciones recibidas');await noOverflow();
    await go('/publicar?kind=person');await noOverflow();await page.screenshot({path:resolve(out,'publicar-'+width+'.png'),fullPage:true});
  }
  pass('Móvil 390 y 768: desplegables al tocar, enlaces, cierre del menú, formulario sin desbordamiento.');
  assert.deepEqual(errors,[]);pass('Sin errores de JavaScript.');
} finally {
  await writeFile(resolve(out,'verification.json'),JSON.stringify({reports,errors},null,2));
  await browser?.close();await new Promise(r=>server.close(r));
}
