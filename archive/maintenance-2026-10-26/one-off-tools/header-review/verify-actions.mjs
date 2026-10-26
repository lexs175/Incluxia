import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const report = { checks: [], errors: [] };
const origin = 'http://127.0.0.1:4458';
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof document.getElementById('btnDemoCandidate')?.onclick === 'function');
  const nav = page.locator('.nav-desktop');
  const initial = await nav.boundingBox();
  await page.locator('.header-actions .header-register').hover();
  await page.waitForTimeout(500);
  const hovered = await nav.boundingBox();
  assert.equal(initial.x, hovered.x);
  assert.equal(initial.width, hovered.width);
  report.checks.push('Hovering Crear cuenta keeps the navigation position and width stable.');

  await page.locator('#btnHeaderLogin').click();
  await page.locator('#authModalWrapper.open').waitFor();
  assert.equal(await page.locator('#tabLoginBtn').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Escape');
  await page.locator('.header-actions .header-register').click();
  await page.locator('#authModalWrapper.open').waitFor();
  assert.equal(await page.locator('#tabRegisterBtn').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Escape');
  report.checks.push('Desktop login and account creation open their correct forms.');

  await page.locator('.nav-desktop a[href="/casos-de-exito"]').click();
  await page.waitForURL('**/casos-de-exito');
  await page.locator('.header[data-ready="true"]').waitFor();
  const casesBox = await nav.boundingBox();
  assert.ok(Math.abs(casesBox.x + casesBox.width / 2 - 720) < 1);
  assert.ok(await page.locator('.brand').isVisible());
  report.checks.push('Navigating to Casos de éxito keeps the brand visible and menu centered.');

  await page.setViewportSize({ width: 390, height: 800 });
  await page.locator('#mobileMenuBtn').click();
  assert.equal(await page.locator('#mobileDrawer').getAttribute('aria-hidden'), 'false');
  assert.equal(await page.locator('main').evaluate(element => element.inert), true);
  await page.locator('#mobileGuestBox [data-auth-trigger="login"]').click();
  await page.locator('#authModalWrapper.open').waitFor();
  assert.equal(await page.locator('#mobileMenuBtn').getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('main').evaluate(element => element.inert), false);
  await page.keyboard.press('Escape');
  await page.locator('#mobileMenuBtn').click();
  await page.locator('#mobileGuestBox [data-auth-trigger="register"]').click();
  await page.locator('#authModalWrapper.open').waitFor();
  assert.equal(await page.locator('#tabRegisterBtn').getAttribute('aria-selected'), 'true');
  await page.keyboard.press('Escape');
  report.checks.push('Mobile login and registration close the menu, unlock page content, and open the correct form.');

  await page.locator('#mobileMenuBtn').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobileMenuBtn').getAttribute('aria-expanded'), 'false');
  await page.locator('#mobileMenuBtn').click();
  await page.setViewportSize({ width: 1440, height: 900 });
  assert.equal(await page.locator('#mobileMenuBtn').getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('html').evaluate(element => element.classList.contains('mobile-menu-open')), false);
  report.checks.push('Escape and resizing to desktop close the mobile menu and restore scrolling.');

  await page.locator('#btnHeaderLogin').click();
  await page.locator('#btnDemoCandidate').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('incluxia_demo_v1') || 'null')?.sessionId === 'demo-valeria');
  await page.goto(origin + '/contratar', { waitUntil: 'domcontentloaded' });
  await page.locator('.header[data-ready="true"]').waitFor();
  assert.equal(await page.locator('.header-actions [data-guest]:visible').count(), 0);
  assert.equal(await page.locator('.nav-desktop .nav-list > li:visible').count(), 5);
  const dropdown = page.locator('.nav-desktop [data-nav-dropdown]').first();
  await dropdown.locator('summary').hover();
  await page.waitForFunction(() => document.querySelector('.nav-desktop [data-nav-dropdown]')?.open === true);
  await page.mouse.move(700, 200);
  await page.keyboard.press('Escape');
  await page.screenshot({ path: 'artifacts/header-review/after/member-1440.png', clip: { x: 0, y: 0, width: 1440, height: 160 } });
  await page.setViewportSize({ width: 390, height: 800 });
  await page.locator('#mobileMenuBtn').click();
  assert.equal(await page.locator('#mobileGuestBox').isVisible(), false);
  assert.equal(await page.locator('.brand').isVisible(), true);
  await page.keyboard.press('Escape');
  report.checks.push('Member navigation keeps its five destinations, hover dropdowns, profile, and mobile menu.');
  assert.deepEqual(report.errors, []);
  await context.close();
  console.log(JSON.stringify(report, null, 2));
} catch (error) { report.failure = error.stack; throw error; }
finally {
  await fs.writeFile('artifacts/header-review/after/actions.json', JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
