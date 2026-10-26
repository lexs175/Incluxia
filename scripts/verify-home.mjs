import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(process.env.ECO_TEST_DIST || 'dist');
const storiesOnly = process.argv.includes('--stories-only');
const galleryOnly = process.argv.includes('--gallery-only');
const out = resolve('artifacts/home');
mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (path !== root && !path.startsWith(root + sep)) throw Error('Ruta fuera de dist');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('No encontrado'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}`;
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
let browser;
const report = { viewports: [], checks: [], errors: [] };
try {
  browser = await chromium.launch({ headless: true, executablePath });
  for (const width of storiesOnly ? [] : galleryOnly ? [1440, 390] : [1920, 1440, 768, 390, 240]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1920 ? 1080 : 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach(img => img.loading = 'eager');
      await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
    });
    for (const section of await page.locator('main [data-guest] section').all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1100);
    }
    const metrics = await page.evaluate(() => {
      const title = document.querySelector('#home-title');
      const bounds = title.getBoundingClientRect();
      return {
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        title: title.textContent.trim(), titleWidth: bounds.width,
        heroHeight: document.querySelector('.ashico-hero').getBoundingClientRect().height,
        fonts: { montserrat: document.fonts.check('800 80px Montserrat'), poppins: document.fonts.check('400 16px Poppins') },
        brokenImages: [...document.querySelectorAll('main [data-guest] img')].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.getAttribute('src')),
        images: [...document.querySelectorAll('.hero-photos img, .guide-image img')].map(img => ({ src: img.getAttribute('src'), width: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })),
        overflowingText: [...document.querySelectorAll('main [data-guest] h1,main [data-guest] h2,main [data-guest] h3,main [data-guest] p')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.textContent.trim()),
      };
    });
    report.viewports.push(metrics);
    assert.ok(metrics.scrollWidth <= width, `Desborde de página a ${width}px`);
    assert.deepEqual(metrics.brokenImages, [], `Imágenes sin cargar a ${width}px`);
    assert.deepEqual(metrics.overflowingText, [], `Texto desbordado a ${width}px`);
    assert.equal(await page.locator('.gallery-toggle').count(), 0);
    await page.locator('#community-gallery').scrollIntoViewIfNeeded();
    const timeBeforeHover = await page.locator('.gallery-track').evaluate(el => el.getAnimations()[0].currentTime);
    await page.locator('#community-gallery').hover();
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.gallery-track').evaluate(el => getComputedStyle(el).animationPlayState), 'running');
    assert.ok(await page.locator('.gallery-track').evaluate(el => el.getAnimations()[0].currentTime) > timeBeforeHover);
    await page.locator('#comunidad [data-auth-trigger]').focus();
    assert.equal(await page.locator('.gallery-track').evaluate(el => getComputedStyle(el).animationPlayState), 'running');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/hero-${width}.png` });
    if ([1440, 768, 390].includes(width)) await page.screenshot({ path: `${out}/home-${width}.png`, fullPage: true });
    if (width === 1440) {
      for (const selector of ['.bento-how-section', '#buscar-trabajo', '#contratar-talento', '#como-publicar', '#tu-actividad', '#comunidad', '.stories-section']) {
        await page.locator(selector).screenshot({ path: `${out}/${selector.replace(/[#.]/g, '')}.png`, animations: 'disabled' });
      }
      await page.locator('#heroBtnContratar').click();
      await page.locator('#registerPanel').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#registerPanelTitle').evaluate(el => el === document.activeElement), true);
      await page.locator('#regFullName').fill('Prueba contratar');
      await page.locator('#regEmail').fill('contratar@prueba.test');
      await page.locator('#regPassword').fill('Prueba1234');
      await page.locator('#btnRegisterSubmit').click();
      await page.waitForURL('**/contratar');
      assert.equal(await page.locator('.access-gate').isVisible(), false);
      report.checks.push('Contratar talento abre el registro y lleva a Contratar al ingresar.');
    }
    if (width === 390) {
      await page.locator('#mobileMenuBtn').click();
      await page.locator('#mobileDrawer').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await page.locator('#heroBtnBuscar').click();
      await page.locator('#registerPanel').waitFor({ state: 'visible' });
      await page.locator('#regFullName').fill('Prueba buscar trabajo');
      await page.locator('#regEmail').fill('buscar@prueba.test');
      await page.locator('#regPassword').fill('Prueba1234');
      await page.locator('#btnRegisterSubmit').click();
      await page.locator('#jobGrid .job-card').first().waitFor({ state: 'visible' });
      assert.equal(await page.locator('.ashico-hero').isVisible(), false);
      report.checks.push('Buscar trabajo abre el registro y muestra las ofertas al ingresar; menú móvil operativo.');
    }
    await context.close();
    console.log(`PASS ${width}px: imágenes, texto, márgenes y galería.`);
  }
  if (!storiesOnly) {
    const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const reducedPage = await reduced.newPage();
    await reducedPage.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await reducedPage.locator('.gallery-track').evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await reducedPage.locator('.gallery-toggle').isVisible(), false);
    await reduced.close();
    report.checks.push('La galería mantiene el movimiento al pasar el cursor o enfocar Crear cuenta y respeta la preferencia de movimiento reducido.');
  }
  const storyContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const storyPage = await storyContext.newPage();
  storyPage.on('pageerror', error => report.errors.push(error.message));
  const stories = JSON.parse(await readFile(resolve('src/data/stories.json'), 'utf8'));
  for (const story of stories) {
    const response = await storyPage.goto(`${url}/casos-de-exito/${story.slug}`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    assert.equal(await storyPage.locator('.story-top-nav, .back-link, .story-share-capsule').count(), 0);
    assert.equal(await storyPage.getByText('Compartir en WhatsApp', { exact: true }).count(), 0);
    assert.equal(await storyPage.locator('.header-badge-row, .custom-badge, .company-badge, .related-stories-section .badge').count(), 0);
    assert.equal(await storyPage.locator('.editorial-section').count(), 3);
    assert.equal(await storyPage.locator('.story-sidebar-col .facts-bento-card').count(), 1);
    assert.equal(await storyPage.locator('.editorial-highlight-quote').count(), 1);
    assert.equal(await storyPage.locator('.related-stories-section .story-card').count(), 3);
    if (story.videoUrl) {
      const player = storyPage.locator('.story-media-frame iframe');
      assert.equal(await player.count(), 1);
      const embed = new URL(await player.getAttribute('src'));
      assert.equal(embed.hostname, 'www.youtube-nocookie.com');
      assert.notEqual(embed.searchParams.get('autoplay'), '1');
      assert.ok(await player.getAttribute('title'));
    } else {
      assert.equal(await storyPage.locator('.story-media-frame img').evaluate(img => img.complete && img.naturalWidth > 0), true);
    }
  }
  await storyPage.waitForTimeout(1300);
  await storyPage.screenshot({ path: `${out}/detalle-historia-1440.png` });
  await storyPage.screenshot({ path: `${out}/detalle-historia-completa-1440.png`, fullPage: true });
  await storyPage.setViewportSize({ width: 390, height: 844 });
  await storyPage.waitForTimeout(400);
  assert.equal(await storyPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await storyPage.screenshot({ path: `${out}/detalle-historia-390.png` });
  await storyContext.close();
  report.checks.push('Las cuatro historias conservan la distribución original, las tres secciones, la cita, la ficha lateral y las tarjetas relacionadas. Se quitaron las etiquetas decorativas y los bloques de retorno y compartir señalados.');
  if (!storiesOnly) {
    const headingContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const headingPage = await headingContext.newPage();
    headingPage.on('pageerror', error => report.errors.push(error.message));
    const decorativeSelectors = '.header-badge-row,.featured-badge-row,.story-category-tag,.blog-category-tag,.badge-wrapper,.siprunpcd-badge,.hub-hero-badge,.job-tags-row,.job-card-header,.cta-label,.caption-tag,.card-top-meta,.verified-badge,.card-counter-badge,.auth-brand-badge,.auth-brand-badge-mobile,.stories-grid-section .badge';
    const files = await readdir(root, { recursive: true });
    let checkedPages = 0;
    for (const file of files.filter(file => file.endsWith('index.html') && !file.replaceAll('\\', '/').startsWith('componentes-temporal/'))) {
      const route = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
      const response = await headingPage.goto(url + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      assert.equal(await headingPage.locator(decorativeSelectors).count(), 0, `Etiqueta decorativa en ${route}`);
      checkedPages++;
    }
    await headingPage.goto(url + '/casos-de-exito', { waitUntil: 'networkidle' });
    await headingPage.locator('.featured-showcase-section').screenshot({ path: `${out}/historias-destacada-sin-etiquetas.png`, animations: 'disabled' });
    await headingPage.goto(url, { waitUntil: 'networkidle' });
    await headingPage.locator('.header-actions [data-auth-trigger="login"]').click();
    await headingPage.locator('#btnDemoCandidate').click();
    await headingPage.locator('#jobGrid .job-card').first().waitFor({ state: 'visible' });
    await headingPage.goto(url + '/perfil', { waitUntil: 'networkidle' });
    await headingPage.locator('#editMyProfile').click();
    await headingPage.locator('#profileEditor').waitFor({ state: 'visible' });
    await headingPage.goto(url + '/contratar', { waitUntil: 'networkidle' });
    assert.equal(await headingPage.locator('.hub-hero-title').isVisible(), true);
    assert.equal(await headingPage.locator(decorativeSelectors).count(), 0);
    await headingContext.close();
    report.checks.push(`${checkedPages} rutas sin etiquetas decorativas en los encabezados; acceso, edición de perfil y Contratar operativos.`);
  }
  assert.deepEqual(report.errors, []);
  console.log('PASS verificación final.');
} catch (error) {
  report.failure = error.stack;
  process.exitCode = 1;
  console.error(error);
} finally {
  writeFileSync(`${out}/${storiesOnly ? 'verification-stories' : galleryOnly ? 'verification-gallery' : 'verification'}.json`, JSON.stringify(report, null, 2));
  await browser?.close();
  await new Promise(r => server.close(r));
}
