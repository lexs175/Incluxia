import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(process.env.ECO_TEST_DIST || 'dist');
const out = resolve('artifacts/workspace');
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
let browser;
const report = { checks: [], viewports: [], errors: [] };
const pass = value => { report.checks.push(value); console.log('PASS', value); };
try {
  const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('#btnHeaderLogin').click();
  await page.locator('#loginPanel').waitFor({ state: 'visible' });
  await page.locator('#btnDemoCandidate').click();
  await page.locator('#jobsMasterExplorer[data-ready="true"]').waitFor({ state: 'visible' });
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('#jobGrid .offer-card').count(), 8);
  assert.equal(await page.locator('#jobsMore').isVisible(), false);
  assert.equal(await page.locator('.footer').isVisible(), false);
  assert.equal(await page.locator('.whatsapp-fab').count(), 0);
  pass('Las ocho ofertas están visibles, sin paginación, footer ni botón flotante.');
  await page.locator('[data-job-type="project"]').click();
  assert.equal(await page.locator('#jobGrid .offer-card').count(), 2);
  await page.locator('[data-job-type=""]').click();
  await page.locator('[data-job-category="Diseño Gráfico"]').click();
  assert.equal(await page.locator('#jobGrid .offer-card').count(), 1);
  assert.equal(await page.locator('#jobGrid .publisher-photo:visible').count(), 1);
  await page.locator('[data-job-category=""]').click();
  await page.locator('#jobSearch').fill('sin-coincidencia-xyz');
  assert.equal(await page.locator('#jobsEmpty').isVisible(), true);
  await page.locator('.reset-empty').click();
  assert.equal(await page.locator('#jobGrid .offer-card').count(), 8);
  const first = await page.locator('#jobGrid .offer-card').first().getAttribute('data-job-id');
  await page.locator('#jobSort').selectOption('oldest');
  assert.notEqual(await page.locator('#jobGrid .offer-card').first().getAttribute('data-job-id'), first);
  await page.locator('#jobSort').selectOption('recent');
  pass('Búsqueda, tipos, especialidades, foto de quien publica, vacío y orden de resultados.');
  await page.locator('#toggleJobFilters').click();
  await page.locator('#jobFilterForm select[name="city"]').selectOption('Remoto');
  const remote = await page.locator('#jobGrid .job-location').allTextContents();
  assert.ok(remote.length > 0 && remote.length < 8);
  assert.ok(remote.every(value => value.includes('Remoto')));
  await page.locator('.filters-reset').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#jobFilters').isVisible(), false);
  pass('Filtros desplegables, ubicación, limpieza y cierre con Escape.');
  for (const width of [1920, 1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1920 ? 1080 : 1000 });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('#jobsMasterExplorer[data-ready="true"]').waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach(img => img.loading = 'eager');
      await Promise.all([...document.images].filter(img => img.hasAttribute('src')).map(img => img.decode().catch(() => {})));
    });
    const metrics = await page.evaluate(() => {
      const card = document.querySelector('.offer-card');
      const title = card.querySelector('.job-title');
      const budget = card.querySelector('.budget-amount');
      const button = card.querySelector('.btn-text-capsule');
      const tokenProbe = document.createElement('span');
      tokenProbe.style.color = 'var(--color-bg-primary)';
      document.body.append(tokenProbe);
      const primaryColor = getComputedStyle(tokenProbe).color;
      tokenProbe.remove();
      return {
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        primaryColor,
        card: { width: card.getBoundingClientRect().width, height: card.getBoundingClientRect().height },
        columns: getComputedStyle(document.querySelector('.jobs-cards-grid')).gridTemplateColumns,
        title: { color: getComputedStyle(title).color, weight: getComputedStyle(title).fontWeight },
        budget: { color: getComputedStyle(budget).color, fontSize: getComputedStyle(budget).fontSize },
        button: { color: getComputedStyle(button).backgroundColor, height: button.getBoundingClientRect().height },
        fonts: { montserrat: document.fonts.check('500 18px Montserrat'), poppins: document.fonts.check('500 32px Poppins') },
        shadows: [...document.querySelectorAll('body *')].filter(el => getComputedStyle(el).boxShadow !== 'none' || getComputedStyle(el).textShadow !== 'none').length,
        brokenImages: [...document.querySelectorAll('.offer-card img[src]')].filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')),
        overflows: [...document.querySelectorAll('.offer-card')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.dataset.jobId),
      };
    });
    report.viewports.push(metrics);
    assert.ok(metrics.scrollWidth <= width, `Desborde de pantalla a ${width}`);
    assert.equal(metrics.title.color, 'rgb(0, 0, 0)');
    assert.equal(metrics.title.weight, '500');
    assert.equal(metrics.button.color, metrics.primaryColor);
    assert.ok(Math.abs(metrics.button.height - 34) < 2, `Altura del botón fuera de la escala fluida a ${width}px`);
    assert.equal(metrics.shadows, 0);
    assert.deepEqual(metrics.brokenImages, []);
    assert.deepEqual(metrics.overflows, []);
    await page.screenshot({ path: `${out}/inicio-${width}.png`, fullPage: true });
    await page.locator('#toggleJobFilters').click();
    assert.equal(await page.locator('#jobFilters').isVisible(), true);
    if (width > 767) {
      const side = await page.locator('#jobFilters').boundingBox();
      const results = await page.locator('.jobs-results').boundingBox();
      assert.ok(side.x + side.width <= results.x);
    }
    await page.screenshot({ path: `${out}/filtros-${width}.png`, fullPage: true });
    await page.locator('#toggleJobFilters').click();
    pass(`Composición, tarjeta Figma, imágenes y filtros a ${width}px.`);
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: 'networkidle' });
  const card = page.locator('#jobGrid .offer-card').first();
  await card.evaluate(el => { el.style.width = '397.625px'; });
  await card.screenshot({ path: `${out}/tarjeta-figma.png` });
  report.figmaCard = await card.evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height, price: getComputedStyle(el.querySelector('.budget-amount')).fontSize, arrowWidth: el.querySelector('.btn-badge--right').getBoundingClientRect().width }));
  assert.equal(report.figmaCard.height, 280);
  assert.equal(report.figmaCard.price, '32px');
  assert.equal(Math.round(report.figmaCard.arrowWidth), 34);
  await page.locator('#jobSearch').fill('Soporte');
  await page.locator('#jobGrid .modular-btn').first().click();
  await page.locator('#jobDetail[aria-busy="false"]').waitFor({ state: 'visible' });
  await page.locator('#backToJobs').click();
  await page.locator('#jobsMasterExplorer[data-ready="true"]').waitFor();
  assert.equal(await page.locator('#jobSearch').inputValue(), 'Soporte');
  pass('Ver oferta abre el detalle y volver conserva la búsqueda.');
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
