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

  const info = await page.evaluate(() => {
    // Check for mobile tab container
    const tabs = document.querySelectorAll('[role="tab"]');
    const tabInfo = Array.from(tabs).map(t => ({
      text: t.textContent,
      selected: t.getAttribute('aria-selected'),
    }));

    // Check for tree-related divs
    const allDivs = document.querySelectorAll('div');
    const treeDivCount = Array.from(allDivs).filter(d => 
      d.getAttribute('tabindex') === '0' ||
      window.getComputedStyle(d).overflowY === 'scroll'
    ).length;

    // Check window dimensions
    const isMobile = window.innerWidth <= 768;

    return {
      tabs: tabInfo,
      treeDivCount,
      isMobile,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await page.screenshot({ path: '/tmp/check-mobile.png' });
  await browser.close();
})();
