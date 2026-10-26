import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const output = path.resolve('artifacts/home-image-import');
const root = path.resolve('dist');
const slots = JSON.parse(fs.readFileSync('src/data/image-slots.json', 'utf8'));
const aliases = JSON.parse(fs.readFileSync('src/data/image-aliases.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
const gallery = slots.home.gallery.flat();
const report = { sourceChecks: [], viewports: [], requests: [], errors: [] };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const item of manifest) {
  assert.equal(hash(fs.readFileSync(item.source)), item.sha256, 'Received source changed: ' + item.received);
  assert.equal(hash(fs.readFileSync(path.join('src/assets/images', item.target))), item.sha256, 'Active master changed: ' + item.target);
  assert.equal(hash(fs.readFileSync(item.archive)), item.previousSha256, 'Backup mismatch: ' + item.archive);
  assert.equal(aliases.legacy[item.previous], item.target);
  report.sourceChecks.push({ slot: item.slot, received: item.received, identicalPng: true, originalUntouched: true, previousArchived: true });
}
const homeImages = [...Object.values(slots.home.hero), ...gallery];
assert.equal(new Set(homeImages.map(image => image.src)).size, 11);
assert.equal(new Set(homeImages.map(image => hash(fs.readFileSync(path.join('src/assets/images', image.src))))).size, 11);
assert.ok(homeImages.every(image => slots.assets.some(asset => asset.key === image.src && !asset.provisional)));
assert.ok(gallery.every(image => !Object.values(slots.home.hero).some(hero => hero.src === image.src)));
assert.deepEqual(slots.home.gallery.map(column => column.length), [1, 2, 1, 2, 1, 2]);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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
  for (const width of [1920, 1440, 768, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1100 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.request().resourceType() === 'image') report.requests.push({ url: new URL(response.url()).pathname, status: response.status() }); });
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.locator('.header[data-ready="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const heroImages = page.locator('.hero-photos img');
    assert.equal(await heroImages.count(), 2);
    for (const [index, hero] of Object.values(slots.home.hero).entries()) {
      const image = heroImages.nth(index);
      assert.equal(await image.getAttribute('data-image-source'), hero.src);
      assert.equal(await image.getAttribute('alt'), hero.alt);
      assert.equal(await image.isVisible(), index === 0 || width > 479);
    }
    assert.equal(await heroImages.first().getAttribute('fetchpriority'), 'high');
    await heroImages.evaluateAll(async images => { await Promise.all(images.filter(image => image.getClientRects().length).map(async image => { image.loading = 'eager'; await image.decode(); })); });
    if (width !== 768) {
      await page.waitForTimeout(900);
      await page.locator('.ashico-hero').screenshot({ path: path.join(output, 'hero-' + width + '.png') });
    }
    const galleryImages = page.locator('.gallery-group').first().locator('img');
    assert.equal(await galleryImages.count(), 9);
    assert.equal(await page.locator('.gallery-group').nth(1).locator('img').count(), 9);
    for (const [index, photo] of gallery.entries()) {
      const image = galleryImages.nth(index);
      assert.equal(await image.getAttribute('data-image-source'), photo.src);
      assert.equal(await image.getAttribute('alt'), photo.alt);
    }
    await galleryImages.evaluateAll(async images => { await Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); })); });
    const optimized = await page.locator('.hero-photos img, .gallery-group:first-child img').evaluateAll(images => images.filter(image => image.getClientRects().length).map(image => ({ key: image.dataset.imageSource, src: image.currentSrc, srcset: image.srcset, sizes: image.sizes, loaded: image.complete && image.naturalWidth > 0 })));
    assert.ok(optimized.every(image => image.loaded && image.src.includes('/_astro/') && image.src.endsWith('.webp') && image.srcset && image.sizes));
    await page.locator('#community-gallery').scrollIntoViewIfNeeded();
    const before = await page.locator('.gallery-track').evaluate(element => element.getAnimations()[0].currentTime);
    await page.locator('#community-gallery').hover();
    await page.waitForTimeout(300);
    const animation = await page.locator('.gallery-track').evaluate(element => ({ playState: getComputedStyle(element).animationPlayState, time: element.getAnimations()[0].currentTime }));
    assert.equal(animation.playState, 'running');
    assert.ok(animation.time > before);
    if (width === 1440 || width === 390) await page.locator('#comunidad').screenshot({ path: path.join(output, 'gallery-' + width + '.png'), animations: 'disabled' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    report.viewports.push({ width, hero: width > 479 ? 2 : 1, gallery: 9, optimized: optimized.length, hoverDoesNotPause: true, noOverflow: true });
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  assert.ok(report.requests.every(request => request.status < 400 && request.url.startsWith('/_astro/')));
  console.log(JSON.stringify({ sources: report.sourceChecks.length, homePhotos: homeImages.length, viewports: report.viewports, imageRequests: report.requests.length, errors: report.errors }, null, 2));
} catch (error) { report.failure = error.stack; throw error; }
finally {
  fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
