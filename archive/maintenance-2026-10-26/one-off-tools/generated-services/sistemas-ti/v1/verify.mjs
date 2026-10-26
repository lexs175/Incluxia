import { chromium } from 'playwright';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
const output = path.resolve('artifacts/generated-services/sistemas-ti/v1');
const current = JSON.parse(fs.readFileSync('src/data/hiring.json', 'utf8'));
const before = JSON.parse(fs.readFileSync(path.join(output, 'hiring-before.json'), 'utf8'));
const selected = current.services.filter(service => service.categorySlug === 'sistemas-ti');
assert.equal(selected.length, 4);
const stripped = structuredClone(current);
for (const service of stripped.services.filter(service => service.categorySlug === 'sistemas-ti')) {
  delete service.previewImage;
  delete service.previewAlt;
}
assert.deepEqual(stripped.services.filter(service => service.categorySlug === 'sistemas-ti'), before.services.filter(service => service.categorySlug === 'sistemas-ti'), 'The four service descriptions, authors and prices must stay intact.');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (!file.startsWith(root + path.sep) && file !== root) throw Error('Invalid path');
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const report = { pageErrors: [], checks: [], images: [] };
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof document.getElementById('btnDemoCandidate')?.onclick === 'function');
  await page.locator('#btnHeaderLogin').click();
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.locator('#btnDemoCandidate').click()]);
  await page.waitForFunction(() => document.documentElement.dataset.session === 'member');
  const openServices = async route => {
    await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
    await page.locator('.hiring-explorer-wrapper[data-ready="true"]').waitFor();
    await page.locator('[data-mode-btn="servicios"]:visible').first().click();
    await page.locator('#servicesGrid').waitFor({ state: 'visible' });
  };
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await openServices('/contratar/sistemas-ti/');
    for (const service of selected) {
      const card = page.locator('#servicesGrid .service-card-item[data-id="' + service.id + '"]');
      const image = card.locator('.service-cover-image');
      await image.evaluate(async image => { image.loading = 'eager'; await image.decode(); });
      assert.equal(await image.getAttribute('src'), service.previewImage);
      assert.equal(await card.locator('.service-cover-preview').evaluate(element => getComputedStyle(element, '::after').display), 'none');
      await card.locator('.card-open-trigger').click();
      const panel = page.locator('#drawer-service-' + service.id);
      await panel.waitFor({ state: 'visible' });
      const detailImage = panel.locator('.drawer-service-image');
      await detailImage.evaluate(async image => { image.loading = 'eager'; await image.decode(); });
      assert.equal(await detailImage.getAttribute('src'), service.previewImage);
      assert.equal((await panel.locator('.gallery-package-title').textContent()).trim(), service.title);
      await page.locator('#hiringDrawerCloseBtn').click();
      await page.locator('#hiringSideDrawer').evaluate(async element => { await Promise.allSettled(element.getAnimations().map(animation => animation.finished)); });
      await page.locator('#hiringDrawerBackdrop').evaluate(async element => { await Promise.allSettled(element.getAnimations().map(animation => animation.finished)); });
    }
    await page.locator('#explorerSearchInput').fill('redes');
    assert.equal(await page.locator('#servicesGrid .service-card-item:visible').count(), 1);
    assert.equal(await page.locator('#servicesGrid .service-card-item:visible .service-cover-image').getAttribute('src'), selected[1].previewImage);
    await page.locator('#explorerSearchInput').fill('');
    assert.equal(await page.locator('#servicesGrid .service-card-item:visible').count(), 4);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(output, 'servicios-' + width + '.png'), fullPage: true });
    report.checks.push('Four matching covers/details, filter and no overflow at ' + width + 'px.');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openServices('/contratar/todos/');
  for (const service of selected) assert.equal(await page.locator('#servicesGrid [data-id="' + service.id + '"] .service-cover-image').getAttribute('src'), service.previewImage);
  report.checks.push('Custom images survive the all-categories view and authenticated synchronization.');
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('incluxia_demo_v1'));
    const sample = structuredClone(state.publications.find(publication => publication.id === 'serv-5'));
    sample.id = 'verification-new-service'; sample.slug = sample.id; sample.title = 'Servicio nuevo de verificación';
    state.publications.push(sample);
    localStorage.setItem('incluxia_demo_v1', JSON.stringify(state));
  });
  await openServices('/contratar/sistemas-ti/');
  const added = page.locator('#servicesGrid [data-id="verification-new-service"] .service-cover-image');
  assert.equal(await added.getAttribute('src'), current.categories.find(category => category.slug === 'sistemas-ti').image);
  assert.equal(await added.getAttribute('data-service-preview'), null);
  assert.equal(await page.locator('#drawer-service-verification-new-service .drawer-service-image').count(), 0);
  report.checks.push('A newly published service keeps its category fallback and does not inherit another service image.');
  assert.deepEqual(report.pageErrors, []);
  report.images = selected.map(({ id, title, previewImage }) => ({ id, title, previewImage }));
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
