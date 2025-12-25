const { chromium } = require('playwright');

(async () => {
  console.log('=== Mobile Tree Visibility Test ===');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--kiosk', '--window-size=412,914', '--window-position=0,0']
  });
  
  const context = await browser.newContext({
    viewport: { width: 412, height: 914 }
  });
  
  const page = await context.newPage();
  
  console.log('1. Navigating to http://localhost:3000');
  await page.goto('http://localhost:3000');
  
  // Wait for mobile tabs
  console.log('2. Waiting for mobile tabs...');
  await page.waitForSelector('[role="tablist"]', { timeout: 10000 });
  console.log('✅ Mobile tabs loaded');
  
  // Wait for auto-connect or connection dialog
  await page.waitForTimeout(3000);
  
  // Check if connection dialog exists
  const hasDialog = await page.$('text=Connection settings') !== null;
  console.log(`3. Connection dialog present: ${hasDialog}`);
  
  if (hasDialog) {
    console.log('   Connecting manually...');
    // Scroll to connect button if needed
    const connectBtn = await page.$('button:has-text("Connect")');
    if (connectBtn) {
      await connectBtn.scrollIntoViewIfNeeded();
      await connectBtn.click({ force: true });
      console.log('   ✅ Clicked connect button');
      await page.waitForTimeout(3000);
    }
  } else {
    console.log('   ✅ Auto-connect likely succeeded');
  }
  
  // Check for tree container
  console.log('4. Checking tree container...');
  const treeContainer = await page.$('div[style*="overflowY"]');
  
  if (treeContainer) {
    const box = await treeContainer.boundingBox();
    const styles = await page.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        height: computed.height,
        width: computed.width,
        display: computed.display,
      };
    }, treeContainer);
    
    console.log('   ✅ Tree container found');
    console.log('   - Dimensions:', box);
    console.log('   - Computed height:', styles.height);
    console.log('   - Computed width:', styles.width);
    
    if (box && parseInt(styles.height) > 500) {
      console.log('   ✅✅✅ SUCCESS! Tree container has proper height!');
    } else {
      console.log('   ❌ Tree container height insufficient');
    }
  } else {
    console.log('   ❌ Tree container NOT found');
  }
  
  // Check for tree nodes
  console.log('5. Checking for tree nodes...');
  const treeNodes = await page.$$('[class*="treeNodeRow"]');
  console.log(`   Found ${treeNodes.length} tree node elements`);
  
  if (treeNodes.length > 0) {
    console.log('   ✅ Tree nodes exist in DOM');
    
    const firstNodeBox = await treeNodes[0].boundingBox();
    if (firstNodeBox) {
      console.log('   ✅✅✅ SUCCESS! Tree nodes are VISIBLE!');
      console.log('   - First node box:', firstNodeBox);
    } else {
      console.log('   ❌ Tree nodes not visible (no bounding box)');
    }
  } else {
    console.log('   No tree nodes found (tree may be empty or still loading)');
  }
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/mobile-tree-final.png', fullPage: true });
  console.log('6. Screenshot saved to /tmp/mobile-tree-final.png');
  
  console.log('\n=== Test Complete ===');
  await page.waitForTimeout(2000);
  await browser.close();
})();
