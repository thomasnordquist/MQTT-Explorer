const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--kiosk', '--window-size=412,914'],
  });

  const page = await (await browser.newContext({ viewport: { width: 412, height: 914 } })).newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);

  // Close backdrop
  const backdrop = page.locator('.MuiBackdrop-root');
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: '/tmp/find-tree-01.png' });

  // Find divs with tabindex=0 (Tree has this)
  const treeInfo = await page.evaluate(() => {
    const treeDiv = Array.from(document.querySelectorAll('div[tabindex="0"]')).find(d => {
      const style = window.getComputedStyle(d);
      return style.overflowY === 'scroll';
    });

    if (!treeDiv) return { found: false };

    const style = window.getComputedStyle(treeDiv);
    const parent = treeDiv.parentElement;
    const parentStyle = parent ? window.getComputedStyle(parent) : null;

    return {
      found: true,
      tree: {
        height: style.height,
        width: style.width,
        display: style.display,
        position: style.position,
        overflow: style.overflowY,
        childCount: treeDiv.children.length,
      },
      parent: parentStyle ? {
        height: parentStyle.height,
        width: parentStyle.width,
        display: parentStyle.display,
        position: parentStyle.position,
        class: parent.className,
      } : null,
    };
  });

  console.log('Tree component:', JSON.stringify(treeInfo, null, 2));

  // Check if Topics tab is selected
  const topicsSelected = await page.locator('[data-testid="mobile-tab-topics"]').getAttribute('aria-selected');
  console.log('\nTopics tab selected:', topicsSelected);

  await page.waitForTimeout(5000);
  await browser.close();
})();
