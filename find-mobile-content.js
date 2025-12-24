const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--kiosk', '--window-size=412,914'],
  });

  const page = await (await browser.newContext({ viewport: { width: 412, height: 914 } })).newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);

  const info = await page.evaluate(() => {
    // Find the paneDefaults div
    const paneDiv = Array.from(document.querySelectorAll('div')).find(d =>
      d.className.includes('paneDefaults')
    );
    
    if (!paneDiv) return { error: 'No paneDefaults div' };
    
    return {
      found: true,
      style: {
        display: window.getComputedStyle(paneDiv).display,
        flexDirection: window.getComputedStyle(paneDiv).flexDirection,
        height: window.getComputedStyle(paneDiv).height,
      },
      childCount: paneDiv.children.length,
      children: Array.from(paneDiv.children).map((c, i) => ({
        index: i,
        tag: c.tagName,
        class: c.className,
        testId: c.getAttribute('data-testid'),
      })),
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await browser.close();
})();
