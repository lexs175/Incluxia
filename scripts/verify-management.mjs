import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist'), out = resolve('artifacts/management');
mkdirSync(out, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + new URL(req.url, 'http://local').pathname);
    if (path !== root && !path.startsWith(root + sep)) throw Error('Invalid path');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { checks: [], viewports: [], errors: [] };
const pass = value => { report.checks.push(value); console.log('PASS', value); };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  const go = async path => {
    const response = await page.goto(base + path, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
  };
  const capture = async (name, selector) => {
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator(selector + ' .modular-btn').count(), 0);
      await page.screenshot({ path: resolve(out, `${name}-${width}.png`) });
      report.viewports.push({ name, width, overflow: false });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  };
  await go('/');
  await page.locator('#btnHeaderLogin').click();
  await page.locator('#btnDemoCandidate').click();
  await page.locator('.member-home #jobsMasterExplorer').waitFor();
  const initial = await page.evaluate(() => localStorage.getItem('incluxia_demo_v1'));
  const fixture = JSON.parse(initial);
  const receivedFixture = fixture.applications.find(a => fixture.publications.some(j => j.id === a.jobId && j.ownerId === fixture.sessionId));
  const expectedCandidate = fixture.accounts.find(a => a.id === receivedFixture.applicantId);
  const restore = async () => page.evaluate(value => localStorage.setItem('incluxia_demo_v1', value), initial);

  await go('/publicar?tab=mine');
  let card = page.locator('.publication-card').first();
  assert.equal(await card.locator('.publication-count').innerText(), '1');
  assert.equal(await card.getByRole('link', { name: 'Ver postulaciones (1)', exact: true }).isEnabled(), true);
  const buttons = await card.locator('.publication-footer .management-action').evaluateAll(all => all.slice(0, 2).map(el => el.getBoundingClientRect().height));
  assert.equal(buttons[0], buttons[1]);
  await capture('publications', '#publicationList');
  const incomingJob = await page.evaluate(() => JSON.parse(localStorage.getItem('incluxia_demo_v1')).applications.find(a => a.id === 'application-example-received').jobId);
  await page.evaluate(job => { const state = JSON.parse(localStorage.getItem('incluxia_demo_v1')); state.applications = state.applications.filter(a => a.jobId !== job); localStorage.setItem('incluxia_demo_v1', JSON.stringify(state)); }, incomingJob);
  await go('/publicar?tab=mine');
  card = page.locator('.publication-card').first();
  assert.equal(await card.locator('.publication-count').innerText(), '0');
  assert.equal(await card.getByRole('button', { name: 'Ver postulaciones (0)', exact: true }).isDisabled(), true);
  await card.screenshot({ path: resolve(out, 'publication-count-zero.png') });
  pass('Las publicaciones usan botones normales de igual altura; el contador real distingue una postulación de cero e inhabilita el control vacío.');
  await restore();

  await go('/publicar?tab=mine');
  const serviceFixture = fixture.publications.find(p => p.ownerId === fixture.sessionId && p.type === 'service');
  const serviceCard = () => page.locator('.publication-card').filter({ has: page.getByRole('heading', { name: serviceFixture.title, exact: true }) });
  assert.equal(await serviceCard().getByRole('button', { name: 'Ver consultas (0)', exact: true }).isDisabled(), true);
  assert.equal(await serviceCard().locator('.publication-inquiries').innerText(), '');
  await serviceCard().locator('.publication-footer').screenshot({ path: resolve(out, 'service-inquiries-zero.png') });
  await page.evaluate(service => {
    const state = JSON.parse(localStorage.getItem('incluxia_demo_v1'));
    state.inquiries.push({ id: 'inquiry-layout-test', senderId: state.accounts.find(a => a.id !== state.sessionId).id, recipientId: state.sessionId, serviceId: service.id, message: 'Consulta de prueba para comprobar disponibilidad.', createdAt: '2026-10-25T16:00:00.000Z' });
    localStorage.setItem('incluxia_demo_v1', JSON.stringify(state));
  }, serviceFixture);
  await go('/publicar?tab=mine');
  const inquiries = serviceCard().getByRole('button', { name: 'Ver consultas (1)', exact: true });
  assert.equal(await inquiries.isEnabled(), true);
  assert.equal(await serviceCard().locator('.publication-inquiries').isVisible(), false);
  await serviceCard().locator('.publication-footer').screenshot({ path: resolve(out, 'service-inquiries-one.png') });
  await inquiries.click();
  assert.equal(await inquiries.getAttribute('aria-expanded'), 'true');
  assert.match(await serviceCard().locator('.publication-inquiries').innerText(), /Consulta de prueba/);
  await serviceCard().locator('.publication-inquiries').screenshot({ path: resolve(out, 'service-inquiries-open.png') });
  await inquiries.click();
  assert.equal(await serviceCard().locator('.publication-inquiries').isVisible(), false);
  await page.setViewportSize({ width: 390, height: 1000 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await serviceCard().locator('.publication-footer').screenshot({ path: resolve(out, 'service-inquiries-mobile.png') });
  await page.setViewportSize({ width: 1440, height: 1000 });
  pass('Los servicios aplican el mismo contador: cero deshabilitado, consultas recibidas activas y panel accesible para abrirlas.');
  await restore();

  await go('/postulaciones');
  assert.match(await page.locator('.application-title').first().innerText(), /Asistente/);
  assert.equal(await page.locator('.application-update:visible').count(), 0);
  await capture('sent', '#applicationList');
  await go('/postulaciones?tab=received');
  assert.equal(await page.locator('.application-title').first().innerText(), expectedCandidate.name);
  assert.match(await page.locator('.application-context').first().innerText(), /catálogo/);
  await capture('received', '#applicationList');
  const status = page.locator('[data-application-status]').first();
  assert.equal(await status.locator('option[value="Retirada"]').count(), 0);
  await status.selectOption('Seleccionada');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-application-status]').first().inputValue(), 'Seleccionada');
  await page.getByRole('link', { name: 'Ver perfil', exact: true }).click();
  await page.waitForURL(url => url.pathname === '/postulaciones/perfil' && url.searchParams.get('id') === expectedCandidate.id);
  await page.locator('#profileDetail[aria-busy="false"]').waitFor();
  assert.equal(await page.locator('.profile-name').innerText(), expectedCandidate.name);
  pass('Enviadas prioriza la oferta; recibidas prioriza al candidato. Funcionan perfil y actualización persistente de estado.');

  await go('/postulaciones');
  await page.locator('[data-withdraw]').first().click();
  assert.equal(await page.locator('.application-status').first().innerText(), 'Retirada');
  assert.equal(await page.locator('[data-withdraw]').count(), 0);
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('incluxia_demo_v1'));
    const app = state.applications.find(a => a.id === 'application-example-sent');
    state.sessionId = state.publications.find(j => j.id === app.jobId).ownerId;
    localStorage.setItem('incluxia_demo_v1', JSON.stringify(state));
  });
  await go('/postulaciones?tab=received');
  assert.equal(await page.locator('[data-application-status="application-example-sent"]').isDisabled(), true);
  pass('Retirar una postulación actualiza su estado y evita que quien contrata lo modifique después.');
  await restore();

  await page.evaluate(() => { const state = JSON.parse(localStorage.getItem('incluxia_demo_v1')); state.applications = []; localStorage.setItem('incluxia_demo_v1', JSON.stringify(state)); });
  for (const [name, path] of [['empty-sent', '/postulaciones'], ['empty-received', '/postulaciones?tab=received']]) {
    await go(path);
    assert.equal(await page.locator('.application-card').count(), 0);
    assert.equal(await page.locator('.application-empty').count(), 1);
    await page.screenshot({ path: resolve(out, name + '.png') });
    await page.setViewportSize({ width: 390, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: resolve(out, name + '-mobile.png') });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  pass('Las vistas sin postulaciones muestran una explicación y una acción útil, también en móvil.');
  await restore();

  await go('/publicar?tab=mine');
  card = page.locator('.publication-card').first();
  const trigger = card.locator('.publication-menu-trigger');
  await trigger.focus(); await page.keyboard.press('ArrowDown');
  await card.getByRole('menuitem', { name: 'Pausar', exact: true }).waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
  await trigger.click(); await card.getByRole('menuitem', { name: 'Pausar', exact: true }).click();
  assert.equal(await card.locator('.publication-state').innerText(), 'Pausada');
  await card.locator('.publication-menu-trigger').click(); await card.getByRole('menuitem', { name: 'Activar', exact: true }).click();
  await card.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.locator('#jobDelivery').fill('12 días');
  await page.locator('#btnSubmitPublish').click();
  await page.locator('#publicationPreview').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#publicationFeedback').innerText(), '');
  assert.equal(await page.locator('#previewList .publication-state').innerText(), 'Cambios sin guardar');
  assert.equal(await page.locator('#previewList .publication-menu-trigger').count(), 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: resolve(out, 'preview.png') });
  await page.setViewportSize({ width: 390, height: 1000 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.locator('#confirmPublication').click(); await page.locator('#viewMyPublished').click();
  assert.equal(await page.locator('.publication-card').first().locator('.publication-delivery').innerText(), '12 días');
  await go('/perfil');
  assert.ok(await page.locator('#profileServices .management-action').count() > 0);
  assert.equal(await page.locator('#profileServices .modular-btn').count(), 0);
  pass('Menú accesible, edición, vista previa, confirmación y servicios del perfil conservan su comportamiento con controles coherentes.');
  assert.deepEqual(report.errors, []);
} catch (error) {
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
} finally {
  writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  await new Promise(done => server.close(done));
}
