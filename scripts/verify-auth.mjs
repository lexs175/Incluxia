import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(process.env.ECO_TEST_DIST || 'dist'), out = resolve('artifacts/auth-simplification');
await mkdir(out, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
    if (path !== root && !path.startsWith(root + sep)) throw Error('Invalid path');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}`;
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await chromium.launch({ headless: true, executablePath });
const report = { screens: [], checks: [], errors: [] };

async function open(page, mode = 'register') {
  let trigger = page.locator(`.header-actions [data-auth-trigger="${mode}"]:visible`);
  if (!await trigger.count()) {
    await page.locator('#mobileMenuBtn').click();
    trigger = page.locator(`#mobileDrawer [data-auth-trigger="${mode}"]:visible`);
  }
  await trigger.first().click();
}
async function eye(page, field, toggle) {
  const input = page.locator('#' + field), button = page.locator('#' + toggle);
  await input.fill('contraseña con espacios');
  assert.equal(await input.getAttribute('type'), 'password');
  await button.click();
  assert.equal(await input.getAttribute('type'), 'text');
  assert.equal(await button.getAttribute('aria-label'), 'Ocultar contraseña');
  assert.equal(await button.getAttribute('aria-pressed'), 'true');
  assert.equal(await button.locator('[data-password-hide]').isVisible(), true);
  assert.equal(await button.locator('[data-password-show]').isVisible(), false);
  await button.click();
  assert.equal(await input.getAttribute('type'), 'password');
  assert.equal(await button.getAttribute('aria-label'), 'Mostrar contraseña');
  assert.equal(await input.inputValue(), 'contraseña con espacios');
  assert.equal(await button.locator('[data-password-show]').isVisible(), true);
}
try {
  for (const [width, height] of [[1440, 1000], [1024, 600], [390, 844], [240, 720]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo({ top: 1400, behavior: 'instant' }));
    const position = await page.evaluate(() => scrollY);
    await open(page);
    assert.equal(await page.evaluate(() => scrollY), position);
    assert.equal(await page.locator('#registerForm input').count(), 3);
    assert.equal(await page.locator('#regWhatsApp,#regCity,#regProfession,#btnForgotPassword').count(), 0);
    const copy = await page.locator('#authModalWrapper').innerText();
    assert.doesNotMatch(copy, /WhatsApp|\bPIN\b|demostración|Cuentas de ejemplo/i);
    assert.equal(await page.locator('#btnDemoCandidate').isVisible(), true);
    assert.equal(await page.locator('#registerGoogle').isVisible(), true);
    assert.equal(await page.evaluate(() => document.querySelector('main').inert), true);
    await eye(page, 'regPassword', 'toggleRegisterPass');
    await page.locator('.auth-modal-capsule').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: `${out}/register-${width}.png` });
    await page.locator('#tabLoginBtn').click();
    await eye(page, 'loginPassword', 'toggleLoginPass');
    await page.locator('#toggleLoginPass').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => scrollY), position);
    assert.equal(await page.locator('#loginPassword').getAttribute('type'), 'password');
    assert.equal(await page.evaluate(() => document.querySelector('main').inert), false);
    await open(page, 'login');
    const metrics = await page.locator('.auth-modal-capsule').evaluate(el => ({ width: innerWidth, height: innerHeight, modalWidth: el.getBoundingClientRect().width, overflow: el.scrollWidth > el.clientWidth + 1, font: getComputedStyle(el.querySelector('input')).fontSize, shortTargets: [...el.querySelectorAll('button')].filter(b => b.getClientRects().length && b.getBoundingClientRect().height < 44).length }));
    assert.equal(metrics.overflow, false);
    assert.ok(metrics.modalWidth <= 560, 'Compact modal independent of the global page container');
    assert.equal(metrics.shortTargets, 0);
    assert.ok(parseFloat(metrics.font) >= 16);
    await page.screenshot({ path: `${out}/login-${width}.png` });
    report.screens.push(metrics);
    await context.close();
  }
  report.checks.push('Four viewports, preserved scroll, no overflow, touch targets and input size', 'Three registration fields and email-only login', 'Both password icons, labels and values, masking on close');

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', e => report.errors.push(e.message));
  await page.goto(url + '/casos-de-exito?from=auth', { waitUntil: 'networkidle' });
  await open(page);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'btnDemoCandidate');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'authCloseBtn');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'tabRegisterBtn');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#tabLoginBtn').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('ArrowRight');
  await page.locator('#btnRegisterSubmit').click();
  assert.equal(await page.locator('#registerForm [aria-invalid=true]').count(), 3);
  await page.locator('#regFullName').fill('Ángela Nuñez');
  await page.locator('#regEmail').fill('invalido');
  await page.locator('#regPassword').fill('corta');
  await page.locator('#btnRegisterSubmit').click();
  assert.equal(await page.locator('#registerForm [aria-invalid=true]').count(), 2);
  await page.locator('#regEmail').fill('valeria@ejemplo.test');
  await page.locator('#regPassword').fill('contraseña123');
  await page.locator('#btnRegisterSubmit').click();
  assert.match(await page.locator('#regEmailError').textContent(), /ya tiene una cuenta/);
  assert.equal(await page.locator('#regFullName').inputValue(), 'Ángela Nuñez');
  await page.screenshot({ path: `${out}/duplicate-email.png` });
  await page.locator('#regEmail').fill('angela@prueba.test');
  await page.locator('#btnRegisterSubmit').click();
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.documentElement.dataset.session === 'member');
  assert.equal(new URL(page.url()).pathname, '/casos-de-exito');
  assert.equal(new URL(page.url()).search, '?from=auth');
  const account = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('incluxia_demo_v1')); return s.accounts.find(a => a.id === s.sessionId); });
  assert.equal(account.phone, ''); assert.equal(account.city, '');
  await page.goto(url + '/perfil', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-profile-city]').textContent(), 'Añade tu ciudad');
  await page.locator('#editMyProfile').click();
  assert.equal(await page.locator('#profileForm [name=city]').inputValue(), '');
  report.checks.push('Keyboard and field errors, duplicate email and preserved values', 'Registration without phone or city; return to requested action and profile completion');
  await context.close();

  const preview = await browser.newContext({ reducedMotion: 'reduce' });
  const example = await preview.newPage();
  await example.goto(url, { waitUntil: 'networkidle' });
  await open(example, 'login');
  assert.equal(await example.locator('#btnDemoCandidate').isVisible(), true);
  await example.locator('#btnDemoCandidate').click();
  await example.waitForLoadState('networkidle');
  assert.equal(await example.evaluate(() => JSON.parse(localStorage.getItem('incluxia_demo_v1')).sessionId), 'demo-valeria');
  report.checks.push('Visible Valeria shortcut opens the populated account');
  await preview.close();
  for (const mode of ['login', 'register']) {
    const google = await browser.newContext({ reducedMotion: 'reduce' });
    const googlePage = await google.newPage();
    await googlePage.goto(url + '/casos-de-exito?from=google', { waitUntil: 'networkidle' });
    await open(googlePage, mode);
    await googlePage.locator('#' + (mode === 'login' ? 'loginGoogle' : 'registerGoogle')).click();
    await googlePage.waitForLoadState('networkidle');
    assert.equal(await googlePage.evaluate(() => JSON.parse(localStorage.getItem('incluxia_demo_v1')).sessionId), 'demo-valeria');
    assert.equal(new URL(googlePage.url()).search, '?from=google');
    await google.close();
  }
  report.checks.push('Simulated Google access from login and registration preserves destination');
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify(report));
} catch (error) {
  report.failure = error.stack; process.exitCode = 1; console.error(error);
} finally {
  await writeFile(`${out}/verification.json`, JSON.stringify(report, null, 2));
  await browser.close(); await new Promise(r => server.close(r));
}
