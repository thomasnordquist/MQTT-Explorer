const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--kiosk', '--window-size=412,914', '--window-position=0,0']
  });
  
  const context = await browser.newContext({
    viewport: { width: 412, height: 914 }
  });
  
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000');
  
  // Wait for mobile tabs
  await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
  console.log('Mobile tabs found');
  
  // Wait for connection
  await page.waitForTimeout(5000);
  
  // Check tree container
  const treeContainer = await page.$('div[style*="overflowY"]');
  if (treeContainer) {
    const box = await treeContainer.boundingBox();
    console.log('Tree container bounding box:', box);
    
    const styles = await page.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        height: computed.height,
        width: computed.width,
        overflow: computed.overflow,
        overflowY: computed.overflowY,
        display: computed.display,
        flex: computed.flex,
        position: computed.position
      };
    }, treeContainer);
    console.log('Tree container computed styles:', styles);
  } else {
    console.log('Tree container NOT found');
  }
  
  // Check for TreeNode
  const treeNodes = await page.$$('[class*="treeNodeRow"]');
  console.log(`Found ${treeNodes.length} tree nodes`);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/tree-debug.png', fullPage: true });
  console.log('Screenshot saved to /tmp/tree-debug.png');
  
  await page.waitForTimeout(5000);
  await browser.close();
})();
