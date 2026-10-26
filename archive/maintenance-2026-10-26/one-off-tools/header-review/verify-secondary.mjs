import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = path.resolve('dist');
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
const report = { checks: [], errors: [] };
let browser;
try {
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof document.getElementById('btnDemoCandidate')?.onclick === 'function');
  await page.evaluate(() => document.fonts.ready);
  const appearance = await page.locator('#btnHeaderLogin').evaluate(button => {
    const style = getComputedStyle(button);
    const probe = document.createElement('span');
    probe.style.color = 'var(--color-primary)';
    document.body.append(probe);
    const expectedColor = getComputedStyle(probe).color;
    probe.remove();
    return { variant: button.className, color: style.color, borderColor: style.borderTopColor, expectedColor, background: style.backgroundColor, expectedBackground: getComputedStyle(document.body).backgroundColor, border: style.borderTopWidth, radius: style.borderRadius, height: button.getBoundingClientRect().height };
  });
  assert.ok(appearance.variant.includes('management-action--secondary'));
  assert.equal(appearance.color, appearance.expectedColor);
  assert.equal(appearance.borderColor, appearance.expectedColor);
  assert.equal(appearance.background, appearance.expectedBackground);
  assert.notEqual(appearance.border, '0px');
  assert.equal(appearance.height, 44);
  assert.equal(appearance.radius, '8px');
  await page.screenshot({ path: 'artifacts/header-review/secondary-desktop.png', clip: { x: 0, y: 0, width: 1440, height: 120 } });
  await page.locator('#btnHeaderLogin').focus();
  assert.equal(await page.locator('#btnHeaderLogin').evaluate(button => getComputedStyle(button).outlineStyle), 'solid');
  await page.locator('#btnHeaderLogin').click();
  await page.locator('#authModalWrapper.open').waitFor();
  assert.equal(await page.locator('#tabLoginBtn').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Escape');
  report.checks.push({ desktop: 'Global secondary variant, neutral background, 44px height, 8px radius, keyboard focus and working login', ...appearance });
  await page.setViewportSize({ width: 390, height: 800 });
  await page.locator('#mobileMenuBtn').click();
  const mobileLogin = page.locator('#mobileGuestBox [data-auth-trigger="login"]');
  assert.equal(await mobileLogin.evaluate(button => getComputedStyle(button).backgroundColor), appearance.background);
  await page.screenshot({ path: 'artifacts/header-review/secondary-mobile.png', clip: { x: 0, y: 0, width: 390, height: 340 } });
  await mobileLogin.click();
  await page.locator('#authModalWrapper.open').waitFor();
  assert.equal(await page.locator('#mobileMenuBtn').getAttribute('aria-expanded'), 'false');
  report.checks.push({ mobile: 'Same shared variant and working login from the menu' });
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify(report, null, 2));
} catch (error) { report.failure = error.stack; throw error; }
finally {
  fs.writeFileSync('artifacts/header-review/secondary-verification.json', JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
