import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist');
const out = resolve('artifacts/title-word-motion');
await mkdir(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (path !== root && !path.startsWith(root + sep)) throw Error('Invalid path');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}`;
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({ headless: true, executablePath });
const errors = [];
const report = { widths: [], routes: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.headingFrames = [];
    let start;
    const sample = time => {
      const words = [...document.querySelectorAll('#home-title .line-word')];
      if (words.length) {
        start ??= time;
        window.headingFrames.push({ t: time - start, words: words.map(word => {
          const style = getComputedStyle(word);
          const matrix = new DOMMatrixReadOnly(style.transform);
          return { text: word.textContent, opacity: +style.opacity, x: matrix.m41, y: matrix.m42 };
        }) });
      }
      if (start === undefined || time - start < 1200) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.headingFrames?.some(f => f.t >= 1050));
  const frames = await page.evaluate(() => window.headingFrames);
  const expected = ['Conectamos', 'talento', 'con', 'oportunidades', 'reales'];
  assert.deepEqual(frames[0].words.map(w => w.text), expected);
  assert.ok(frames.some(f => f.words[0].opacity > 0.1 && f.words[1].opacity === 0), 'First word appears before second');
  assert.ok(frames.some(f => f.words[1].opacity > 0.1 && f.words[2].opacity === 0), 'Second word appears before third');
  assert.ok(frames.some(f => f.words[0].x < 0), 'Words enter from the left');
  assert.ok(frames.every(f => f.words.every(w => w.y === 0)), 'No vertical movement');
  assert.ok(frames.every(f => f.words.every((w, i) => !i || f.words[i - 1].opacity >= w.opacity)), 'Reading order throughout reveal');
  assert.equal(await page.locator('.line-char').count(), 0);
  report.animation = { words: expected, firstVisibleMs: expected.map((_, i) => Math.round(frames.find(f => f.words[i].opacity > 0.01).t)), verticalMovement: false };
  for (const width of [1440, 768, 390, 240]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(400);
    const metrics = await page.locator('#home-title').evaluate(title => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      words: [...title.querySelectorAll('.line-word')].map(w => w.textContent),
      masks: title.querySelectorAll('.line-mask').length,
      visible: [...title.querySelectorAll('.line-word')].every(w => getComputedStyle(w).opacity === '1' && getComputedStyle(w).transform === 'none'),
      overflows: [...title.querySelectorAll('.line-mask')].some(w => w.scrollWidth > w.clientWidth + 1),
      accessibleName: title.getAttribute('aria-label'),
    }));
    assert.deepEqual(metrics.words, expected);
    assert.equal(metrics.visible, true);
    assert.equal(metrics.overflows, false, `Title overflow at ${width}`);
    assert.equal(metrics.scrollWidth, width, `Page overflow at ${width}`);
    assert.equal(metrics.accessibleName, expected.join(' '));
    report.widths.push(metrics);
    if (width === 1440 || width === 390 || width === 240) await page.screenshot({ path: `${out}/home-${width}.png` });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const heading = page.locator('main [data-guest] h2').first();
  await heading.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const h = document.querySelector('main [data-guest] h2');
    return h?.querySelectorAll('.line-word').length > 0 && [...h.querySelectorAll('.line-word')].every(w => getComputedStyle(w).opacity === '1');
  });
  report.sectionHeading = await heading.getAttribute('aria-label');
  for (const route of ['/empleos', '/perfiles', '/contratar', '/casos-de-exito', '/perfiles/valeria-morales-teran']) {
    await page.goto(url + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1050);
    const h1 = page.locator('main h1').first();
    assert.ok(await h1.locator('.line-word').count() > 0, route);
    assert.equal(await h1.locator('.line-char').count(), 0);
    report.routes.push({ route, title: await h1.getAttribute('aria-label') });
  }
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('header a[href="/casos-de-exito"]:visible').first().click();
  await page.waitForURL('**/casos-de-exito');
  await page.waitForTimeout(1100);
  assert.ok(await page.locator('main h1 .line-word').count() > 0);
  report.clientNavigation = true;
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(url, { waitUntil: 'networkidle' });
  assert.equal(await reducedPage.locator('#home-title .line-word').count(), 0);
  assert.equal(await reducedPage.locator('#home-title').innerText(), expected.join(' '));
  report.reducedMotion = true;
  await reduced.close();
  assert.deepEqual(errors, []);
  await writeFile(`${out}/verification.json`, JSON.stringify({ ...report, errors }, null, 2));
  console.log(JSON.stringify(report));
} catch (error) {
  await writeFile(`${out}/verification.json`, JSON.stringify({ ...report, errors, failure: error.stack }, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise(r => server.close(r));
}
