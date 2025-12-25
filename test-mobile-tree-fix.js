const { chromium } = require('playwright');

(async () => {
  console.log('Starting browser test...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--kiosk', '--window-size=412,914', '--window-position=0,0']
  });
  
  const context = await browser.newContext({
    viewport: { width: 412, height: 914 }
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:3000');
  await page.goto('http://localhost:3000');
  
  // Wait for mobile tabs
  console.log('Waiting for mobile tabs...');
  await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
  console.log('✅ Mobile tabs found');
  
  // Wait a bit for auto-connect or manual connection
  await page.waitForTimeout(5000);
  
  // Check if we need to connect manually
  const connectButton = await page.$('button:has-text("Connect")');
  if (connectButton) {
    console.log('Connection dialog found, connecting manually...');
    
    // Fill in connection details
    await page.fill('input[placeholder*="localhost"]', '127.0.0.1');
    await page.click('button:has-text("Connect")');
    
    console.log('Clicked connect, waiting for connection...');
    await page.waitForTimeout(3000);
  }
  
  // Check if tree container exists and is visible
  console.log('Checking for tree container...');
  const treeContainer = await page.$('div[style*="overflowY"]');
  
  if (treeContainer) {
    const box = await treeContainer.boundingBox();
    console.log('✅ Tree container bounding box:', box);
    
    const styles = await page.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        height: computed.height,
        width: computed.width,
        display: computed.display,
        position: computed.position,
        overflow: computed.overflow,
        overflowY: computed.overflowY,
      };
    }, treeContainer);
    console.log('Tree container computed styles:', styles);
    
    // Check if tree has actual height
    if (box && box.height > 100) {
      console.log('✅✅✅ SUCCESS! Tree container has proper height:', box.height);
    } else {
      console.log('❌ FAILED! Tree container height too small:', box?.height || 'null');
    }
  } else {
    console.log('❌ Tree container NOT found');
  }
  
  // Check for TreeNode elements
  const treeNodes = await page.$$('[class*="treeNodeRow"]');
  console.log(`Found ${treeNodes.length} tree node elements`);
  
  if (treeNodes.length > 0) {
    console.log('✅ Tree nodes exist in DOM');
    
    // Check if they're visible
    const firstNodeBox = await treeNodes[0].boundingBox();
    if (firstNodeBox) {
      console.log('✅✅✅ SUCCESS! Tree nodes are VISIBLE!', firstNodeBox);
    } else {
      console.log('❌ Tree nodes exist but not visible (no bounding box)');
    }
  }
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/tree-fix-test.png', fullPage: true });
  console.log('Screenshot saved to /tmp/tree-fix-test.png');
  
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('Test complete');
})();
