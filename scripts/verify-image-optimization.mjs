import { chromium } from 'playwright';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import assert from 'node:assert/strict';

const output = path.resolve('artifacts/image-optimization');
const root = path.resolve(process.env.ECO_TEST_DIST || 'dist');
const slots = JSON.parse(fs.readFileSync('src/data/image-slots.json', 'utf8'));
const hiring = JSON.parse(fs.readFileSync('src/data/hiring.json', 'utf8'));
const profiles = JSON.parse(fs.readFileSync('src/data/profiles.json', 'utf8'));
const stories = JSON.parse(fs.readFileSync('src/data/stories.json', 'utf8'));
const report = { checks: [], failures: [], measurements: [], requests: [], pageErrors: [], staticPages: 0 };
const walk = directory => fs.existsSync(directory) ? fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]) : [];
const check = (test, message) => { assert.ok(test, message); report.checks.push(message); };
check(new Set(hiring.services.map(service => service.previewImage)).size === 32, '32 independently replaceable service sources.');
check(new Set(hiring.categories.map(category => category.image)).size === 8, '8 independently replaceable category sources.');
check(new Set(profiles.map(profile => profile.photo)).size === 19, '19 distinct profile portraits.');
check(new Set(slots.home.gallery.flat().map(image => image.src)).size === 9, '9 independent gallery slots.');
check(slots.home.hero.primary.src !== slots.home.hero.secondary.src, 'Two independent hero sources.');
const unrelated = new Set([...hiring.categories.map(category => category.image), ...profiles.map(profile => profile.photo), ...stories.map(story => story.image), ...Object.values(slots.home.hero).map(image => image.src)]);
check(slots.home.gallery.flat().every(image => !unrelated.has(image.src)), 'Replacing a gallery file does not replace a profile, story, category or hero file.');
check(walk('public').every(file => file.endsWith('favicon.svg') || !/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(file)), 'Image masters are outside public; favicon keeps its public URL.');
check(walk(path.join(root, 'images')).length === 0, 'No former public image originals are shipped in dist/images.');
for (const file of walk(root).filter(file => file.endsWith('.html'))) {
  report.staticPages++;
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0], src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    if (!src) continue;
    if (src.startsWith('data:image/svg+xml')) continue;
    assert.ok(src.startsWith('/_astro/'), 'Unmanaged static image in ' + file + ': ' + src);
    assert.ok(fs.existsSync(path.join(root, decodeURIComponent(src))), 'Missing built image: ' + src);
    if (!src.endsWith('.svg')) {
      assert.ok(/\bsrcset="/.test(tag) && /\bsizes="/.test(tag), 'Missing responsive attributes: ' + src);
      assert.ok(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), 'Missing intrinsic dimensions: ' + src);
      assert.ok(src.endsWith('.webp'), 'Raster photo is not WebP: ' + src);
    }
  }
}
report.checks.push(report.staticPages + ' compiled pages have valid optimized image references and dimensions.');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer((request, response) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://local').pathname));
    if (file !== root && !file.startsWith(root + path.sep)) throw Error('Invalid path');
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); response.end(fs.readFileSync(file));
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const configuration of [{ width: 390, dpr: 1 }, { width: 768, dpr: 1 }, { width: 1440, dpr: 1 }, { width: 390, dpr: 2 }, { width: 768, dpr: 2 }, { width: 1440, dpr: 2 }]) {
    const context = await browser.newContext({ viewport: { width: configuration.width, height: 1000 }, deviceScaleFactor: configuration.dpr });
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push(error.message));
    page.on('response', response => { if (response.request().resourceType() === 'image' && new URL(response.url()).origin === origin) report.requests.push({ url: new URL(response.url()).pathname, status: response.status() }); });
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof document.getElementById('btnDemoCandidate')?.onclick === 'function');
    const hero = page.locator('.hero-photos img').first();
    await hero.evaluate(async image => { await image.decode(); });
    assert.equal(await hero.getAttribute('fetchpriority'), 'high');
    const measurements = async (selector, limit = 4) => {
      await page.locator(selector).evaluateAll(async (images, limit) => { await Promise.all(images.slice(0, limit).map(async image => { image.loading = 'eager'; await image.decode(); })); }, limit);
      const records = await page.locator(selector).evaluateAll((images, limit) => images.slice(0, limit).map(image => ({ source: image.dataset.imageSource, src: image.currentSrc, sizes: image.sizes, width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height, loaded: image.complete && image.naturalWidth > 0, fit: getComputedStyle(image).objectFit })), limit);
      for (const record of records) {
        const file = path.join(root, decodeURIComponent(new URL(record.src).pathname));
        const metadata = await sharp(file).metadata();
        report.measurements.push({ viewportWidth: configuration.width, dpr: configuration.dpr, ...record, pixels: metadata.width, bytes: fs.statSync(file).size });
        assert.ok(record.loaded && record.width > 0, 'Image not visible/loaded: ' + record.source);
      }
      return records;
    };
    await measurements('.hero-photos img', configuration.width < 480 ? 1 : 2);
    if (configuration.dpr === 1 && configuration.width !== 768) await page.screenshot({ path: path.join(output, 'home-' + configuration.width + '.png') });
    if (configuration.width < 768) await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#btnHeaderLogin').click();
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.locator('#btnDemoCandidate').click()]);
    await page.setViewportSize({ width: configuration.width, height: 1000 });
    await page.goto(origin + '/contratar', { waitUntil: 'domcontentloaded' });
    await page.locator('.hub-categories-grid[data-ready="true"]').waitFor();
    await measurements('.category-cover', 1);
    await page.goto(origin + '/contratar/sistemas-ti', { waitUntil: 'domcontentloaded' });
    await page.locator('.hiring-explorer-wrapper[data-ready="true"]').waitFor();
    await page.locator('[data-mode-btn="servicios"]:visible').first().click();
    await page.locator('#servicesGrid').waitFor({ state: 'visible' });
    await page.locator('#servicesGrid img.service-cover-image').evaluateAll(async images => { await Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode(); })); });
    for (const service of hiring.services.filter(service => service.categorySlug === 'sistemas-ti')) {
      const card = page.locator('#servicesGrid [data-id="' + service.id + '"]');
      assert.equal(await card.locator('.service-cover-image').getAttribute('data-image-source'), service.previewImage);
      await card.locator('.card-open-trigger').click();
      const detail = page.locator('#drawer-service-' + service.id + ' .drawer-service-image');
      await detail.evaluate(async image => { await image.decode(); });
      assert.equal(await detail.getAttribute('data-image-source'), service.previewImage);
      await page.locator('#hiringDrawerCloseBtn').click();
      await page.locator('#hiringSideDrawer').evaluate(async element => { await Promise.allSettled(element.getAnimations().map(animation => animation.finished)); });
    }
    await measurements('#servicesGrid img.service-cover-image');
    await page.locator('#explorerSearchInput').fill('redes');
    assert.equal(await page.locator('#servicesGrid .service-card-item:visible').count(), 1);
    await page.locator('#explorerSearchInput').fill('');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (configuration.dpr === 1) await page.screenshot({ path: path.join(output, 'services-' + configuration.width + '.png'), fullPage: true });
    await page.goto(origin + '/perfil', { waitUntil: 'domcontentloaded' });
    await page.locator('#profileDetail[data-ready="true"]').waitFor();
    await page.locator('.profile-avatar-img').evaluate(async image => { await image.decode(); });
    await measurements('.profile-avatar-img');
    // Compatibility with sessions saved before paths and file extensions changed.
    await page.evaluate(() => { const state = JSON.parse(localStorage.getItem('incluxia_demo_v1')); state.accounts.find(account => account.id === state.sessionId).photo = '/images/profiles/valeria-morales.jpg'; localStorage.setItem('incluxia_demo_v1', JSON.stringify(state)); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.profile-avatar-img').evaluate(async image => { await image.decode(); });
    assert.equal(await page.locator('.profile-avatar-img').getAttribute('data-image-source'), profiles[0].photo);
    assert.ok((await page.locator('#headerProfileImg').getAttribute('srcset'))?.includes('/_astro/'));
    report.checks.push('Guest/member, service detail, filtering, profile and legacy saved photo at ' + configuration.width + 'px / DPR ' + configuration.dpr + '.');
    if (configuration.width === 1440 && configuration.dpr === 1) {
      for (const profile of profiles) {
        await page.goto(origin + '/perfiles/' + profile.slug, { waitUntil: 'domcontentloaded' });
        await page.locator('#profileDetail[data-ready="true"]').waitFor();
        const image = page.locator('.profile-avatar-img');
        await image.evaluate(async image => { await image.decode(); });
        assert.equal(await image.getAttribute('data-image-source'), profile.photo, profile.name);
      }
      report.checks.push('All 19 profiles keep the correct optimized portrait.');
      await page.goto(origin + '/contratar/todos', { waitUntil: 'domcontentloaded' });
      await page.locator('.hiring-explorer-wrapper[data-ready="true"]').waitFor();
      await page.locator('[data-mode-btn="servicios"]:visible').first().click();
      for (const service of hiring.services) assert.equal(await page.locator('#servicesGrid [data-id="' + service.id + '"] .service-cover-image').getAttribute('data-image-source'), service.previewImage);
      report.checks.push('All 32 independent service images survive session synchronization.');
      await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('incluxia_demo_v1'));
        const sample = structuredClone(state.publications.find(publication => publication.id === 'serv-5'));
        sample.id = 'image-test-service'; sample.slug = sample.id; sample.title = 'Servicio de prueba de imágenes';
        state.publications.push(sample); localStorage.setItem('incluxia_demo_v1', JSON.stringify(state));
      });
      await page.goto(origin + '/contratar/sistemas-ti', { waitUntil: 'domcontentloaded' });
      await page.locator('.hiring-explorer-wrapper[data-ready="true"]').waitFor();
      const added = page.locator('#servicesGrid [data-id="image-test-service"] .service-cover-image');
      assert.equal(await added.getAttribute('data-image-source'), hiring.categories.find(category => category.slug === 'sistemas-ti').image);
      assert.ok((await added.getAttribute('srcset'))?.includes('/_astro/'));
      report.checks.push('A new service gets its category variants instead of inheriting another package image.');
      await page.goto(origin + '/empleos', { waitUntil: 'domcontentloaded' });
      await page.locator('#jobsMasterExplorer[data-ready="true"]').waitFor();
      const photos = page.locator('#jobGrid .publisher-photo:not([hidden])');
      if (await photos.count()) assert.ok((await photos.first().getAttribute('srcset'))?.includes('/_astro/'));
      // User-provided images must clear a previous local responsive source set.
      const dataURL = 'data:image/png;base64,' + (await sharp({ create: { width: 16, height: 16, channels: 3, background: 'navy' } }).png().toBuffer()).toString('base64');
      await page.evaluate(dataURL => { const state = JSON.parse(localStorage.getItem('incluxia_demo_v1')); state.accounts.find(account => account.id === state.sessionId).photo = dataURL; localStorage.setItem('incluxia_demo_v1', JSON.stringify(state)); }, dataURL);
      await page.goto(origin + '/perfil', { waitUntil: 'domcontentloaded' });
      await page.locator('#profileDetail[data-ready="true"]').waitFor();
      const custom = page.locator('.profile-avatar-img');
      await custom.evaluate(async image => { await image.decode(); });
      assert.equal(await custom.getAttribute('src'), dataURL);
      assert.equal(await custom.getAttribute('srcset'), null);
      report.checks.push('User-provided images work without inheriting another portrait srcset.');
    }
    await context.close();
  }
  assert.deepEqual(report.pageErrors, []);
  assert.ok(report.requests.every(request => request.status < 400 && request.url.startsWith('/_astro/')), 'Broken image or former public URL requested.');
  report.checks.push('No JavaScript errors, broken image responses or image requests to old public paths.');
  console.log(JSON.stringify({ checks: report.checks, measurements: report.measurements.length, imageRequests: report.requests.length, errors: report.pageErrors }, null, 2));
} catch (error) { report.failures.push(error.message); throw error; }
finally { fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2)); await browser?.close(); await new Promise(resolve => server.close(resolve)); }
