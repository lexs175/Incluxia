import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(process.env.ECO_TEST_DIST || 'dist'), out = resolve('artifacts/hiring');
mkdirSync(out, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (path !== root && !path.startsWith(root + sep)) throw Error('Ruta no válida');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const bytes = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
    res.end(bytes);
  } catch { res.writeHead(404); res.end('No encontrado'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const url = `http://127.0.0.1:${server.address().port}`;
const report = { checks: [], viewports: [], errors: [] };
const pass = value => { report.checks.push(value); console.log('PASS', value); };
let browser;
try {
  const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('#btnHeaderLogin').click();
  await page.locator('#btnDemoCandidate').click();
  await page.locator('#jobsMasterExplorer[data-ready="true"]').waitFor();
  for (const width of [1920, 1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(url + '/contratar', { waitUntil: 'networkidle' });
    await page.locator('.hub-categories-grid[data-ready="true"]').waitFor();
    assert.equal(await page.locator('#hubSearchInput, .hub-quick-search-box, .hub-bottom-action, .hub-guarantee-banner').count(), 0);
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('.category-cover').forEach(img => img.loading = 'eager');
      await Promise.all([...document.querySelectorAll('.category-rubro-card img')].map(img => img.decode().catch(() => {})));
    });
    const metrics = await page.evaluate(() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      cards: [...document.querySelectorAll('.category-rubro-card')].map(card => ({
        slug: card.dataset.categorySlug, width: card.getBoundingClientRect().width, height: card.getBoundingClientRect().height,
        cover: { src: card.querySelector('.category-cover').getAttribute('src'), loaded: card.querySelector('.category-cover').naturalWidth > 0 },
        button: { color: getComputedStyle(card.querySelector('.btn-text-capsule')).backgroundColor, height: card.querySelector('.btn-text-capsule').getBoundingClientRect().height },
        shadow: getComputedStyle(card).boxShadow,
        overflow: card.scrollWidth > card.clientWidth + 1,
        href: card.querySelector('a').getAttribute('href'),
      })),
    }));
    report.viewports.push(metrics);
    assert.ok(metrics.scrollWidth <= width, 'La página no debe tener desbordamiento horizontal.');
    assert.equal(metrics.cards.length, 8);
    assert.ok(metrics.cards.every(card => card.cover.loaded && !card.overflow && card.shadow === 'none'));
    assert.ok(metrics.cards.every(card => card.button.color === 'rgb(255, 255, 255)' && Math.abs(card.button.height - 34) < 2));
    assert.ok(metrics.cards.every(card => card.href === '/contratar/' + card.slug));
    await page.screenshot({ path: `${out}/categorias-${width}.png`, fullPage: true });
    if (width === 1920) {
      const first = page.locator('.category-rubro-card').first();
      await first.evaluate(el => { el.style.width = '359px'; });
      await first.screenshot({ path: `${out}/tarjeta-figma.png` });
      await first.evaluate(el => { el.style.width = ''; });
    }
    pass(`Ocho imágenes locales, enlaces, botón Figma y distribución a ${width}px.`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url + '/contratar', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.category-rubro-card:visible').count(), 8);
  await page.locator('.category-rubro-card').first().click({ position: { x: 25, y: 25 } });
  await page.waitForURL('**/contratar/diseno-grafico');
  await page.goto(url + '/contratar', { waitUntil: 'networkidle' });
  await page.locator('.category-rubro-card[data-category-slug="sistemas-ti"] .category-action-button').click();
  await page.waitForURL('**/contratar/sistemas-ti');
  pass('El buscador, la acción inferior y el banner ya no se muestran; la imagen y el botón siguen abriendo su categoría.');
  assert.deepEqual(report.errors, []);
  await context.close();
} catch (error) {
  report.failure = error.stack;
  process.exitCode = 1;
  console.error(error);
} finally {
  writeFileSync(`${out}/verification.json`, JSON.stringify(report, null, 2));
  await browser?.close();
  await new Promise(done => server.close(done));
}
