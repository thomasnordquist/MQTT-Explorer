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
    const tabs = document.querySelector('[data-testid="mobile-tab-topics"]');
    if (!tabs) return { error: 'No tabs' };
    
    const container = tabs.parentElement?.parentElement;
    if (!container) return { error: 'No container' };
    
    const style = window.getComputedStyle(container);
    
    return {
      container: {
        display: style.display,
        flexDirection: style.flexDirection,
        height: style.height,
        width: style.width,
      },
      childCount: container.children.length,
      secondChild: container.children[1] ? {
        tag: container.children[1].tagName,
        style: {
          flex: window.getComputedStyle(container.children[1]).flex,
          height: window.getComputedStyle(container.children[1]).height,
          position: window.getComputedStyle(container.children[1]).position,
        },
        childCount: container.children[1].children.length,
      } : null,
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await browser.close();
})();
