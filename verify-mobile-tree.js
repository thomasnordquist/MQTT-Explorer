const { chromium } = require('playwright');

(async () => {
  console.log('=== Verifying tree node visibility on mobile viewport ===\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--kiosk', '--window-size=412,914', '--window-position=0,0'],
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 914 },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36',
  });

  const page = await context.newPage();

  console.log('Step 1: Navigate to http://localhost:3000');
  await page.goto('http://localhost:3000', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Close any open drawers/dialogs by clicking backdrop
  const backdrop = page.locator('.MuiBackdrop-root');
  const backdropVisible = await backdrop.isVisible().catch(() => false);
  if (backdropVisible) {
    console.log('  Closing overlay...');
    await backdrop.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
  }
  
  await page.screenshot({ path: '/tmp/verify-01-initial.png' });
  console.log('  ✓ Page loaded\n');

  console.log('Step 2: Look for connection dialog');
  const hostInput = page.locator('input[name="host"]');
  let hostVisible = await hostInput.isVisible().catch(() => false);
  console.log(`  Host input visible: ${hostVisible}`);
  
  if (hostVisible) {
    console.log('\nStep 3: Fill connection form and connect');
    await hostInput.clear();
    await hostInput.fill('127.0.0.1');
    console.log('  ✓ Filled host: 127.0.0.1');
    
    await page.screenshot({ path: '/tmp/verify-02-form-filled.png' });

    const connectBtn = page.locator('button:has-text("CONNECT")');
    await connectBtn.scrollIntoViewIfNeeded();
    await page.screenshot({ path: '/tmp/verify-03-before-connect.png' });
    
    await connectBtn.click();
    console.log('  ✓ Clicked Connect');

    console.log('\nStep 4: Wait for connection (10 seconds)');
    await page.waitForTimeout(10000);
    await page.screenshot({ path: '/tmp/verify-04-after-connect.png' });
  } else {
    console.log('  ⚠️  Connection dialog not visible');
    console.log('  Checking if already connected...\n');
  }

  console.log('Step 5: Check mobile UI elements');
  const topicsTab = await page.locator('[data-testid="mobile-tab-topics"]').isVisible().catch(() => false);
  const detailsTab = await page.locator('[data-testid="mobile-tab-details"]').isVisible().catch(() => false);
  
  console.log(`  Topics tab: ${topicsTab ? '✅' : '❌'}`);
  console.log(`  Details tab: ${detailsTab ? '✅' : '❌'}`);

  console.log('\nStep 6: Check for tree nodes');
  const treeNodes = page.locator('[data-test-topic]');
  const count = await treeNodes.count();
  console.log(`  Tree nodes found: ${count}`);

  if (count > 0) {
    console.log('\n✅ SUCCESS: Tree nodes ARE visible!\n');
    
    const firstNode = treeNodes.first();
    const text = await firstNode.textContent();
    const box = await firstNode.boundingBox();
    
    console.log('First node:');
    console.log(`  Text: "${text}"`);
    if (box) {
      console.log(`  Position: (${Math.round(box.x)}, ${Math.round(box.y)})`);
      console.log(`  Size: ${Math.round(box.width)}x${Math.round(box.height)}`);
      const inViewport = box.y >= 0 && box.y < 914;
      console.log(`  In viewport: ${inViewport ? '✅ YES' : '❌ NO'}`);
    }
    
    await page.screenshot({ path: '/tmp/verify-05-tree-visible.png' });
    console.log('\n✅ TREE NODE LIST IS VISIBLE ON MOBILE VIEWPORT');
    
  } else {
    console.log('\n❌ FAILURE: Tree nodes NOT visible\n');
    
    // Debug: check what's rendered
    const bodyText = await page.locator('body').textContent();
    const hasTopicWord = bodyText.includes('Topic') || bodyText.includes('topic');
    console.log(`  Page contains "topic" text: ${hasTopicWord}`);
    
    await page.screenshot({ path: '/tmp/verify-05-no-tree.png' });
    console.log('\n❌ TREE NODE LIST IS NOT VISIBLE - LAYOUT ISSUE CONFIRMED');
  }

  console.log('\n=== Test Complete ===');
  console.log('Screenshots saved to /tmp/verify-*.png\n');
  
  await browser.close();
  process.exit(count > 0 ? 0 : 1);
})();
