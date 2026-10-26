import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
const dev=process.argv.includes('--dev');
const refreshPreviews=process.argv.includes('--refresh-preview-images');
const root=resolve(process.env.ECO_TEST_DIST || 'dist');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
let server;
if(!dev){
 server=createServer(async(req,res)=>{
  try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}if((await stat(path)).isDirectory())path=resolve(path,'index.html');const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(data);}
  catch{res.writeHead(404);res.end('No encontrado');}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
}
const url=dev?'http://localhost:4321':'http://127.0.0.1:'+server.address().port;
const out='artifacts/platform';mkdirSync(out,{recursive:true});
const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser=await chromium.launch({headless:true,executablePath});
const errors=[],reports=[];
const pass=message=>{reports.push(message);console.log('PASS',message);};
async function go(page,path){const response=await page.goto(url+path,{waitUntil:'networkidle'});assert.equal(response.status(),200,path);await page.evaluate(()=>document.fonts.ready);}
async function signup(page,name,email,phone){
 await go(page,'/');await page.locator('.header-actions [data-auth-trigger=register]').click();
 await page.locator('#regFullName').fill(name);await page.locator('#regEmail').fill(email);await page.locator('#regPassword').fill('Prueba1234');await page.locator('#btnRegisterSubmit').click();
 await page.locator('.member-home #jobsMasterExplorer').waitFor({state:'visible'});await page.waitForLoadState('networkidle');
 await go(page,'/perfil');await page.locator('#editMyProfile').click();await page.locator('#profileForm [name=profession]').fill('Profesional de prueba');await page.locator('#profileForm [name=city]').fill('Cochabamba');await page.locator('#profileForm [name=phone]').fill(phone);await page.locator('#profileForm button[type=submit]').click();await go(page,'/');
}
async function logout(page){await page.locator('#headerAccountTrigger').hover();if(!await page.locator('#headerProfileWrapper').evaluate(el=>el.open))await page.locator('#headerAccountTrigger').click();await page.locator('#btnHeaderLogout').click();await page.locator('.ashico-hero').waitFor({state:'visible'});await page.waitForLoadState('networkidle');}
async function login(page,email){await page.locator('.header-actions #btnHeaderLogin').click();await page.locator('#loginIdentifier').fill(email);await page.locator('#loginPassword').fill('Prueba1234');await page.locator('#btnLoginSubmit').click();await page.locator('.member-home #jobsMasterExplorer').waitFor({state:'visible'});await page.waitForLoadState('networkidle');}
async function publicationStatus(item,name){await item.locator('.publication-menu-trigger').click();await item.getByRole('menuitem',{name,exact:true}).click();}
async function publish(page,kind,title){
 await go(page,'/publicar');await page.locator('.publication-kind-option[data-kind="'+kind+'"]').click();
 await page.locator('#jobTitle').fill(title);await page.locator('#jobCategory').selectOption('Diseño Gráfico');await page.locator('#jobDelivery').fill('10 días');await page.locator('#jobBudget').fill('850');await page.locator('#jobDescription').fill('Diseñar un catálogo y coordinar las entregas por escrito.');await page.locator('#jobTasks').fill('Preparar una propuesta visual\nEntregar archivos editables');
 if(kind==='company')await page.locator('#jobCompany').fill('Estudio de prueba');
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).publications.length);
 await page.locator('#btnSubmitPublish').click();await page.locator('#publicationPreview').waitFor({state:'visible'});
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).publications.length),before);
 await page.locator('#confirmPublication').click();await page.locator('#publishSuccessBox').waitFor({state:'visible'});
 const href=await page.locator('#viewPublished').getAttribute('href');await page.locator('#viewMyPublished').click();return href;
}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 await go(page,'/');assert.equal(await page.locator('.nav-desktop .nav-link:visible').count(),2);assert.equal(await page.locator('header a[href^="/blog"],footer a[href^="/blog"]').count(),0);assert.equal(await page.locator('.ashico-hero').isVisible(),true);assert.equal(await page.locator('.bento-how-section').isVisible(),true);
 await go(page,'/perfil');assert.equal(await page.locator('.access-gate').isVisible(),true);
 await signup(page,'Lucía de prueba','lucia@prueba.test','59170000991');
 assert.equal(await page.locator('#jobGrid .offer-card').count(),8);assert.deepEqual((await page.locator('.nav-desktop .nav-link:visible').allTextContents()).map(text=>text.trim()),['Trabajos','Contratar','Publicaciones','Postulaciones']);assert.equal(await page.locator('.ashico-hero').isVisible(),false);
 assert.equal(await page.locator('#jobGrid .offer-card .modular-btn').count(),8);
 assert.equal(await page.locator('#jobGrid .job-card-header').count(),0);
 pass('Cuenta común, navegación interior y ocho ofertas con sus acciones.');
 await page.locator('#jobSearch').fill('sin-coincidencias-xyz');assert.equal(await page.locator('#jobsEmpty').isVisible(),true);await page.locator('#jobsEmpty [data-reset-jobs]').click();assert.equal(await page.locator('#jobGrid .offer-card').count(),8);assert.equal(await page.locator('#jobsMore').isVisible(),false);
 pass('Búsqueda, estado vacío y limpieza de filtros sin paginación.');
 await go(page,'/perfil');await page.locator('#editMyProfile').click();await page.locator('#profileForm [name=profession]').fill('Diseñadora editorial');await page.locator('#profileForm [name=category]').selectOption('Diseño Gráfico');await page.locator('#profileForm [name=bio]').fill('Diseño catálogos y coordino por escrito.');await page.locator('#profileForm [name=skills]').fill('Diseño editorial, Figma');await page.locator('#profileForm [name=experience]').fill('Diseño editorial · Estudio · 2024 a 2026');await page.locator('#profileForm [name=portfolio]').fill('Catálogo | https://example.com/catalogo');await page.locator('#profileForm button[type=submit]').click();await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('.profile-headline-role').innerText(),/Diseñadora editorial/);assert.match(await page.locator('.experience-list').innerText(),/Estudio/);
 pass('Perfil propio con el diseño existente, edición y persistencia.');
 await go(page,'/contratar/diseno-grafico');await page.locator('#explorerSearchInput').fill('sin-coincidencia-xyz');assert.equal(await page.locator('#hiringEmpty').isVisible(),true);await page.locator('#resetHiringFilters').click();
 await page.locator('#explorerSearchInput').fill('Lucía de prueba');const accountId=await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).sessionId);await page.locator('.autonomo-card-item[data-id="'+accountId+'"] .autonomo-name').click();assert.match(await page.locator('#drawer-autonomo-'+accountId).innerText(),/Diseñadora editorial/);await page.locator('#hiringDrawerCloseBtn').click();
 pass('Perfil actualizado dentro de Contratar y detalle original; vacío y limpieza de filtros.');

 const title='Catálogo editorial de prueba',href=await publish(page,'person',title),jobId=new URL(href,url).searchParams.get('id');
 await go(page,'/');await page.locator('#jobSearch').fill(title);assert.equal(await page.locator('#jobGrid .job-card').count(),1);await page.locator('#jobGrid .modular-btn').click();await page.locator('#jobDetail[aria-busy="false"]').waitFor({state:'visible'});assert.equal(await page.locator('#openApplication').isDisabled(),true);await page.locator('#backToJobs').click();await page.locator('#jobsMasterExplorer[data-ready="true"]').waitFor({state:'visible'});assert.equal(await page.locator('#jobSearch').inputValue(),title);
 pass('Publicación confirmada visible en Inicio; detalle propio y retorno con filtros.');
 await go(page,'/publicar?tab=mine');let item=page.locator('#publicationList .publication-card').filter({has:page.getByRole('heading',{name:title,exact:true})});
 await item.getByRole('button',{name:'Editar',exact:true}).click();await page.locator('#jobDelivery').fill('12 días');await page.locator('#btnSubmitPublish').click();await page.locator('#confirmPublication').click();await page.locator('#viewMyPublished').click();
 item=page.locator('#publicationList .publication-card').filter({has:page.getByRole('heading',{name:title,exact:true})});await publicationStatus(item,'Pausar');await go(page,'/');await page.locator('#jobSearch').fill(title);assert.equal(await page.locator('#jobGrid .job-card').count(),0);await go(page,'/publicar?tab=mine');item=page.locator('#publicationList .publication-card').filter({has:page.getByRole('heading',{name:title,exact:true})});await publicationStatus(item,'Activar');
 await publish(page,'company','Vacante de empresa de prueba');const serviceHref=await publish(page,'service','Servicio editorial de prueba');
 pass('Empresa, persona y servicio; administración, edición, pausa y reactivación.');
 await logout(page);await signup(page,'Mateo de prueba','mateo@prueba.test','59170000992');await go(page,href);
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).applications.length);await page.locator('#openApplication').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).applications.length),before);await page.locator('#applicantNote').fill('Me interesa colaborar por escrito.');await page.locator('#btnSubmitJob').click();assert.equal(await page.locator('#openApplication').isDisabled(),true);
 await go(page,'/postulaciones');assert.equal(await page.locator('#applicationList .application-card').count(),1);await page.locator('[data-withdraw]').click();assert.match(await page.locator('#applicationList').innerText(),/Retirada/);
 await go(page,href);await page.locator('#openApplication').click();await page.locator('#btnSubmitJob').click();assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).applications.filter(a=>a.jobId===id).length,jobId),1);
 pass('Postulación después de confirmar; control de duplicados y retirada.');
 await go(page,serviceHref);const serviceId=new URL(serviceHref,url).searchParams.get('service'),panel=page.locator('#drawer-service-'+serviceId);await panel.waitFor({state:'visible'});await panel.locator('[data-contact-open]').click();await panel.locator('textarea[name=message]').fill('Necesito un catálogo. ¿Tienes disponibilidad?');await panel.locator('form button[type=submit]').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('incluxia_demo_v1')).inquiries.length),1);await page.locator('#hiringDrawerCloseBtn').click();
 pass('Servicios nuevos dentro de Contratar con las tarjetas y el detalle originales; consulta simulada.');
 await logout(page);await login(page,'lucia@prueba.test');await go(page,'/postulaciones?tab=received&job='+jobId);assert.match(await page.locator('#applicationList').innerText(),/Mateo de prueba/);await page.locator('[data-application-status]').selectOption('En revisión');await go(page,'/publicar?tab=mine');const serviceItem=page.locator('#publicationList .publication-card').filter({has:page.getByRole('heading',{name:'Servicio editorial de prueba',exact:true})});const inquiries=serviceItem.getByRole('button',{name:'Ver consultas (1)',exact:true});assert.equal(await inquiries.isEnabled(),true);await inquiries.click();assert.match(await serviceItem.locator('.publication-inquiries').innerText(),/Necesito un catálogo/);
 await logout(page);await login(page,'mateo@prueba.test');await go(page,'/postulaciones');assert.match(await page.locator('#applicationList').innerText(),/En revisión/);
 pass('Postulaciones recibidas y estados coherentes entre cuentas; consultas visibles para quien publica.');
 await page.setViewportSize({width:390,height:844});await go(page,'/');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#toggleJobFilters').click();assert.equal(await page.locator('#jobFilters').isVisible(),true);await page.locator('#mobileMenuBtn').click();assert.equal(await page.locator('#mobileDrawer').isVisible(),true);await page.locator('#mobileAccountLink').click();await page.locator('#profileDetail[aria-busy="false"]').waitFor({state:'visible'});assert.equal(await page.locator('.profile-name').innerText(),'Mateo de prueba');
 pass('Inicio, filtros, navegación y perfil utilizables en celular.');
 await context.close();
 const captureContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),capture=await captureContext.newPage();await go(capture,'/');await capture.locator('.header-actions #btnHeaderLogin').click();await capture.locator('#btnDemoCandidate').click();await capture.waitForLoadState('networkidle');
 for(const [name,path] of [['empleos','/'],['detalle','/empleos/oferta?id=job-2'],['contratar','/contratar'],['publicar','/publicar'],['perfil','/perfil'],['postulaciones','/postulaciones']]){
  await go(capture,path);await capture.addStyleTag({content:'astro-dev-toolbar{display:none}'});const preview=out+'/preview-'+name+'.png';await capture.screenshot({path:preview});if(refreshPreviews)copyFileSync(preview,'src/assets/images/platform/'+name+'.png');
 }
 await captureContext.close();pass('Seis capturas de las pantallas reales para la portada.');
 const publicContext=await browser.newContext({reducedMotion:'reduce'}),publicPage=await publicContext.newPage();
 for(const width of [1440,768,390,240]){
  await publicPage.setViewportSize({width,height:1000});await go(publicPage,'/');
  await publicPage.evaluate(async()=>{for(const image of document.images)image.loading='eager';await Promise.all(Array.from(document.images).map(image=>image.decode().catch(()=>{})));});
  assert.deepEqual(await publicPage.locator('img[src]').evaluateAll(all=>all.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src'))),[]);
  assert.equal(await publicPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const menu=await publicPage.locator('#mobileMenuBtn').boundingBox();if(width<=390)assert.ok(menu&&menu.x+menu.width<=width,'Menú móvil dentro de la pantalla');
  await publicPage.screenshot({path:out+'/publico-final-'+width+'.png'});
 }
 await publicContext.close();pass('Portada con imágenes reales disponibles, cuatro tamaños y menú móvil accesible.');

 assert.deepEqual(errors,[],'Errores JavaScript');
 writeFileSync(out+'/verification.json',JSON.stringify({reports,errors},null,2));
}catch(error){console.error(error);process.exitCode=1;writeFileSync(out+'/verification.json',JSON.stringify({reports,errors,failure:String(error)},null,2));}
finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
