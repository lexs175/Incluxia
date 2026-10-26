import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import sharp from 'sharp';

const output = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve('dist');
const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
const hiring = JSON.parse(fs.readFileSync('src/data/hiring.json', 'utf8'));
const before = JSON.parse(fs.readFileSync(path.join(output, 'hiring.before.json'), 'utf8'));
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const report = { sourceChecks: [], browserChecks: [], requests: [], errors: [] };
assert.equal(hiring.services.filter(service => service.previewProvisional).length, 0);
for (const entry of manifest) {
  const source = fs.readFileSync(entry.source);
  const target = fs.readFileSync(path.join('src/assets/images', entry.target));
  assert.equal(hash(source), entry.sourceSha256);
  assert.equal(hash(target), entry.targetSha256);
  assert.equal(hash(await sharp(source).ensureAlpha().raw().toBuffer()), hash(await sharp(target).ensureAlpha().raw().toBuffer()));
  report.sourceChecks.push({ number: entry.number, serviceId: entry.serviceId, pixelsPreserved: true, originalUntouched: true });
}
for (const service of hiring.services) {
  const original = before.services.find(item => item.id === service.id);
  if (manifest.some(entry => entry.serviceId === service.id)) {
    const { previewAlt, previewProvisional, ...unchanged } = service;
    const { previewAlt: oldAlt, previewProvisional: oldProvisional, ...oldUnchanged } = original;
    assert.deepEqual(unchanged, oldUnchanged, 'Other service fields changed: ' + service.id);
  } else assert.deepEqual(service, original, 'An existing service changed: ' + service.id);
}
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer((request, response) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://local').pathname));
    if (file !== root && !file.startsWith(root + path.sep)) throw Error('Invalid path');
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(fs.readFileSync(file));
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const configuration of [{ width: 1440, member: true }, { width: 390, member: true }]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.request().resourceType() === 'image') report.requests.push({ url: new URL(response.url()).pathname, status: response.status() }); });
    if (configuration.member) {
      await page.goto(origin, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => typeof document.getElementById('btnDemoCandidate')?.onclick === 'function');
      await page.locator('#btnHeaderLogin').click();
      await page.locator('#btnDemoCandidate').click();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('incluxia_demo_v1') || 'null')?.sessionId === 'demo-valeria');
    }
    await page.setViewportSize({ width: configuration.width, height: 1000 });
    for (const category of hiring.categories.slice(2)) {
      await page.goto(origin + '/contratar/' + category.slug, { waitUntil: 'domcontentloaded' });
      await page.locator('.hiring-explorer-wrapper[data-ready="true"]').waitFor();
      await page.locator('[data-mode-btn="servicios"]:visible').first().click();
      await page.locator('#servicesGrid').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#servicesGrid .service-card-item:visible').count(), 4);
      for (const entry of manifest.filter(entry => entry.category === category.slug)) {
        const card = page.locator('#servicesGrid [data-id="' + entry.serviceId + '"]');
        const image = card.locator('.service-cover-image');
        await image.evaluate(async element => { element.loading = 'eager'; await element.decode(); });
        assert.equal(await image.getAttribute('data-image-source'), entry.target);
        assert.equal(await image.getAttribute('alt'), entry.alt);
        const imageState = await image.evaluate(element => ({ source: element.currentSrc, srcset: element.srcset, sizes: element.sizes, width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }));
        assert.ok(imageState.source.includes('/_astro/') && imageState.source.endsWith('.webp'));
        assert.ok(imageState.srcset && imageState.sizes);
        assert.ok(Math.abs(imageState.width / imageState.height - 12 / 5) < 0.02);
        await card.locator('.card-open-trigger').click();
        const detail = page.locator('#drawer-service-' + entry.serviceId + ' .drawer-service-image');
        await detail.evaluate(async element => { await element.decode(); });
        assert.equal(await detail.getAttribute('data-image-source'), entry.target);
        await page.locator('#hiringDrawerCloseBtn').click();
        await page.locator('#hiringSideDrawer').evaluate(async element => { await Promise.allSettled(element.getAnimations().map(animation => animation.finished)); });
        report.browserChecks.push({ serviceId: entry.serviceId, width: configuration.width, member: configuration.member, cardAndDetail: true, optimized: true });
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow: ' + category.slug);
      if (category.slug === 'contabilidad-finanzas' || category.slug === 'ilustracion-arte') {
        await page.locator('#servicesGrid').screenshot({ path: path.join(output, category.slug + '-' + configuration.width + '.png') });
      }
    }
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  assert.ok(report.requests.every(request => request.status < 400 && request.url.startsWith('/_astro/')));
  console.log(JSON.stringify({ sources: report.sourceChecks.length, browserChecks: report.browserChecks.length, imageRequests: report.requests.length, errors: report.errors, all32HaveOwnCover: true }, null, 2));
} catch (error) { report.failure = error.stack; throw error; }
finally {
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
