import { test, expect } from '@playwright/test';

test('Verify mobile viewport is pixel-perfect with 0 horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4322/contratar/contabilidad-finanzas');
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
    return {
      windowWidth: window.innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
      mainScrollWidth: document.querySelector('.explorer-main-content')?.clientWidth,
      topBarWidth: document.querySelector('.explorer-top-bar')?.clientWidth,
      mobileControlsWidth: document.querySelector('.mobile-controls-bar')?.clientWidth,
      cardWidth: document.querySelector('.autonomo-card-item')?.clientWidth,
    };
  });

  console.log('MOBILE DATA:', data);
  expect(data.bodyScrollWidth).toBe(390);

  // Take screenshot
  await page.screenshot({ path: 'tests/mobile-clean.png' });
});
