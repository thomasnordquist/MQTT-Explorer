const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--kiosk', '--window-size=412,914'],
  });

  const page = await (await browser.newContext({ viewport: { width: 412, height: 914 } })).newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);

  const backdrop = page.locator('.MuiBackdrop-root');
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: '/tmp/debug-01-state.png' });

  const topicsTab = await page.locator('[data-testid="mobile-tab-topics"]').getAttribute('aria-selected');
  console.log('Topics tab selected:', topicsTab);

  const nodeCount = await page.locator('[data-test-topic]').count();
  console.log('Tree nodes:', nodeCount);

  const treeDivInfo = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const scrollDiv = divs.find(d => window.getComputedStyle(d).overflowY === 'scroll');
    if (scrollDiv) {
      const style = window.getComputedStyle(scrollDiv);
      return {
        height: style.height,
        width: style.width,
        overflow: style.overflowY,
        display: style.display,
        childCount: scrollDiv.children.length,
        scrollHeight: scrollDiv.scrollHeight,
        clientHeight: scrollDiv.clientHeight,
      };
    }
    return null;
  });

  console.log('Tree scroll div:', JSON.stringify(treeDivInfo, null, 2));

  await page.waitForTimeout(5000);
  await browser.close();
})();
