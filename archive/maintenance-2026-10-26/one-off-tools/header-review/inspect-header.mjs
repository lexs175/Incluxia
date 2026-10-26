import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const phase = process.argv[2] || 'before';
const output = path.resolve('artifacts/header-review', phase);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const records = [];
try {
  for (const width of phase === 'after' ? [1920, 1440, 1100, 1024, 768, 390, 320, 240] : [1440, 1100, 1024, 768, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4458/', { waitUntil: 'domcontentloaded' });
    await page.locator('.header[data-ready="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(output, 'guest-' + width + '.png'), clip: { x: 0, y: 0, width, height: 440 } });
    const record = await page.evaluate(({ width, errors }) => {
      const box = selector => {
        const element = document.querySelector(selector);
        const rect = element.getBoundingClientRect();
        const css = getComputedStyle(element);
        return { text: element.textContent.trim(), x: rect.x, y: rect.y, width: rect.width, height: rect.height, display: css.display, align: css.alignItems, lineHeight: css.lineHeight, fontSize: css.fontSize };
      };
      return { width, errors, session: document.documentElement.dataset.session, horizontalOverflow: document.documentElement.scrollWidth - innerWidth, header: box('.header'), capsule: box('.navbar-capsule'), brand: box('.brand'), nav: box('.nav-desktop'), actions: box('.header-actions'), register: box('.header-actions [data-auth-trigger="register"]'), login: box('#btnHeaderLogin'), mobile: box('#mobileMenuBtn') };
    }, { width, errors });
    records.push(record);
    if (phase === 'after') {
      assert.equal(record.session, 'guest');
      assert.ok(record.brand.width > 35 && record.brand.height >= 44, 'Brand hidden at ' + width);
      assert.ok(Math.abs(record.brand.y + record.brand.height / 2 - record.actions.y - record.actions.height / 2) < 1, 'Vertical misalignment at ' + width);
      assert.ok(record.actions.x >= record.brand.x + record.brand.width, 'Actions overlap brand at ' + width);
      assert.ok(record.actions.x + record.actions.width <= record.capsule.x + record.capsule.width, 'Actions overflow capsule at ' + width);
      if (width > 1024) assert.ok(Math.abs(record.nav.x + record.nav.width / 2 - record.capsule.x - record.capsule.width / 2) < 1, 'Navigation off center at ' + width);
      if (width >= 360) assert.ok(record.register.height >= 44, 'Register target below 44px at ' + width);
      assert.deepEqual(errors, []);
    }
    if (width === 390 || width === 768) {
      await page.locator('#mobileMenuBtn').click();
      await page.screenshot({ path: path.join(output, 'guest-menu-' + width + '.png'), clip: { x: 0, y: 0, width, height: 700 } });
      if (phase === 'after') {
        assert.equal(await page.locator('.header [data-auth-trigger="register"]:visible').count(), 1);
        assert.equal(await page.locator('.header [data-auth-trigger="login"]:visible').count(), 1);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#mobileMenuBtn').getAttribute('aria-expanded'), 'false');
      }
    }
    await context.close();
  }
} finally { await browser.close(); }
await fs.writeFile(path.join(output, 'measurements.json'), JSON.stringify(records, null, 2) + '\n');
console.log(JSON.stringify(records.map(record => ({ width: record.width, brandWidth: record.brand.width, navCenter: record.nav.width ? record.nav.x + record.nav.width / 2 : null, capsuleCenter: record.capsule.x + record.capsule.width / 2, actionHeight: record.actions.height, errors: record.errors })), null, 2));
