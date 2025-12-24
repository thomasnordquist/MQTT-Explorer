const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--kiosk', '--window-size=412,914'],
  });

  const page = await (await browser.newContext({ viewport: { width: 412, height: 914 } })).newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);

  // Get the entire layout hierarchy
  const layout = await page.evaluate(() => {
    const getStyles = (el) => {
      const s = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        class: el.className,
        id: el.id,
        display: s.display,
        position: s.position,
        height: s.height,
        width: s.width,
        flex: s.flex,
        overflow: s.overflow,
        overflowY: s.overflowY,
        top: s.top,
        bottom: s.bottom,
        left: s.left,
        right: s.right,
      };
    };

    // Find tree scroll div
    const scrollDiv = Array.from(document.querySelectorAll('div')).find(d => 
      window.getComputedStyle(d).overflowY === 'scroll'
    );

    if (!scrollDiv) return { error: 'No scroll div found' };

    // Get parent chain
    const chain = [];
    let current = scrollDiv;
    for (let i = 0; i < 6 && current; i++) {
      chain.push(getStyles(current));
      current = current.parentElement;
    }

    return { chain };
  });

  console.log(JSON.stringify(layout, null, 2));

  await browser.close();
})();
