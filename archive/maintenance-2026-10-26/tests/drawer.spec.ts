import { test, expect } from '@playwright/test';

test('Verify drawer z-index, navbar coverage, and 100% frozen background scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4322/contratar/contabilidad-finanzas');
  await page.waitForTimeout(600);

  // 1. Scroll down a bit to test scroll restoration
  await page.evaluate(() => window.scrollTo(0, 250));
  await page.waitForTimeout(200);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  expect(scrollBefore).toBe(250);

  // 2. Click on the first autonomo card to open drawer
  const card = page.locator('.autonomo-card-item').first();
  await card.click();
  await page.waitForTimeout(500);

  // 3. Inspect DOM hierarchy, z-index and positions
  const state = await page.evaluate(() => {
    const backdrop = document.querySelector('.hiring-drawer-backdrop');
    const drawer = document.querySelector('.hiring-side-drawer');
    const header = document.querySelector('.header');
    const fab = document.querySelector('.whatsapp-fab');
    const body = document.body;
    const html = document.documentElement;

    const backdropCs = backdrop ? window.getComputedStyle(backdrop) : null;
    const drawerCs = drawer ? window.getComputedStyle(drawer) : null;
    const headerCs = header ? window.getComputedStyle(header) : null;
    const fabCs = fab ? window.getComputedStyle(fab) : null;

    // Hit-test on screen:
    // Where the navbar capsule is (center top)
    const centerTopEl = document.elementFromPoint(window.innerWidth / 2, 40);
    // Where the backdrop is (left side)
    const backdropEl = document.elementFromPoint(150, 400);
    // Where the drawer is (right side)
    const drawerEl = document.elementFromPoint(window.innerWidth - 100, 400);

    return {
      bodyHasDrawerOpen: body.classList.contains('drawer-open'),
      htmlHasDrawerOpen: html.classList.contains('drawer-open'),
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      backdropZ: backdropCs ? backdropCs.zIndex : null,
      drawerZ: drawerCs ? drawerCs.zIndex : null,
      headerZ: headerCs ? headerCs.zIndex : null,
      fabVisibility: fabCs ? fabCs.visibility : null,
      fabOpacity: fabCs ? fabCs.opacity : null,
      centerTopElement: centerTopEl ? `${centerTopEl.tagName}.${centerTopEl.className}` : null,
      backdropElement: backdropEl ? `${backdropEl.tagName}.${backdropEl.className}` : null,
      drawerElement: drawerEl ? `${drawerEl.tagName}.${drawerEl.className}` : null,
      drawerParent: drawer?.parentElement?.tagName,
      backdropParent: backdrop?.parentElement?.tagName,
    };
  });

  console.log('--- VERIFICATION STATE ---');
  console.log(JSON.stringify(state, null, 2));

  // Assert drawer and backdrop are direct children of body or in slot
  expect(state.bodyHasDrawerOpen).toBe(true);
  expect(state.htmlHasDrawerOpen).toBe(true);
  expect(state.bodyPosition).toBe('fixed');
  expect(state.bodyTop).toBe('-250px');
  expect(Number(state.backdropZ)).toBe(9998);
  expect(Number(state.drawerZ)).toBe(9999);
  expect(state.fabVisibility).toBe('hidden');

  // Center top element MUST be the backdrop overlay (covering navbar)
  expect(state.centerTopElement).toContain('hiring-drawer-backdrop');

  // 4. Test wheel scroll over backdrop (MUST NOT SCROLL)
  await page.mouse.move(150, 400);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(300);
  const scrollAfterBackdropWheel = await page.evaluate(() => window.scrollY);
  expect(scrollAfterBackdropWheel).toBe(0); // Because body is fixed at -250px, window.scrollY is 0 during lock

  // 5. Test wheel scroll inside drawer
  await page.mouse.move(1440 - 100, 400);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(300);
  const scrollAfterDrawerWheel = await page.evaluate(() => window.scrollY);
  expect(scrollAfterDrawerWheel).toBe(0);

  // Take screenshot of open state
  await page.screenshot({ path: 'tests/drawer-verified.png' });

  // 6. Close drawer via close button
  const closeBtn = page.locator('#hiringDrawerCloseBtn');
  await closeBtn.click();
  await page.waitForTimeout(400);

  // Verify scroll is restored to 250px
  const scrollAfterClose = await page.evaluate(() => window.scrollY);
  expect(scrollAfterClose).toBe(250);
  console.log('Scroll restoration verified! Back to:', scrollAfterClose);
});
