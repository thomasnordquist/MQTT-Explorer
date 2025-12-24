const { chromium } = require('playwright');

(async () => {
  console.log('Starting interactive mobile viewport inspection...');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--kiosk', '--window-size=412,914', '--window-position=0,0'],
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 914 },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36',
  });

  const page = await context.newPage();
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('DevTools') && !text.includes('MUI') && !text.includes('component')) {
      console.log('>>>', text);
    }
  });

  await page.goto('http://localhost:3000', { timeout: 30000, waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('\n=== Looking for Connect/Disconnect button ===');
  const disconnectBtn = page.locator('button:has-text("DISCONNECT"), button:has-text("Disconnect")');
  const connectBtn = page.locator('button:has-text("CONNECT"), button:has-text("Connect")');
  
  const disconnectVisible = await disconnectBtn.isVisible().catch(() => false);
  const connectVisible = await connectBtn.isVisible().catch(() => false);
  
  console.log(`Disconnect button visible: ${disconnectVisible}`);
  console.log(`Connect button visible: ${connectVisible}`);
  
  if (disconnectVisible) {
    console.log('Currently CONNECTED - clicking Disconnect first...');
    await disconnectBtn.click();
    await page.waitForTimeout(2000);
  }
  
  await page.screenshot({ path: '/tmp/mobile-01-initial.png' });
  
  console.log('\n=== Looking for connection dialog/button ===');
  const allButtons = await page.locator('button').all();
  console.log(`Found ${allButtons.length} buttons on page`);
  
  for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
    const text = await allButtons[i].textContent();
    const visible = await allButtons[i].isVisible();
    console.log(`  Button ${i}: "${text}" (visible: ${visible})`);
  }
  
  // Check if there's a connection dialog
  const connectionDialog = page.locator('[data-testid="connection-dialog"]');
  const dialogVisible = await connectionDialog.isVisible().catch(() => false);
  console.log(`Connection dialog visible: ${dialogVisible}`);
  
  if (!dialogVisible) {
    console.log('Looking for connect action in menu...');
    const menuBtn = page.locator('button[aria-label="Menu"]');
    const menuVisible = await menuBtn.isVisible().catch(() => false);
    console.log(`Menu button visible: ${menuVisible}`);
    
    if (menuVisible) {
      await menuBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/mobile-02-menu-open.png' });
    }
  }
  
  // Look for host input
  const hostInput = page.locator('input[name="host"]');
  const hostVisible = await hostInput.isVisible().catch(() => false);
  console.log(`Host input visible: ${hostVisible}`);
  
  if (hostVisible) {
    console.log('\n=== Connecting to broker ===');
    await hostInput.fill('127.0.0.1');
    await page.screenshot({ path: '/tmp/mobile-03-form-filled.png' });
    
    const finalConnectBtn = page.locator('button:has-text("CONNECT"), button:has-text("Connect")').first();
    await finalConnectBtn.scrollIntoViewIfNeeded();
    await finalConnectBtn.click();
    console.log('Clicked Connect');
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/tmp/mobile-04-connected.png' });
  }
  
  console.log('\n=== Checking for tree nodes ===');
  const tabs = await page.locator('[data-testid="mobile-tab-topics"]').isVisible().catch(() => false);
  console.log(`Mobile tabs visible: ${tabs}`);
  
  const treeNodes = page.locator('[data-test-topic]');
  const count = await treeNodes.count();
  console.log(`Tree nodes found: ${count}`);
  
  if (count > 0) {
    console.log('✅ Tree nodes ARE VISIBLE!');
    const first = await treeNodes.first().textContent();
    const box = await treeNodes.first().boundingBox();
    console.log(`First node: "${first}"`);
    console.log(`Position: x=${box?.x}, y=${box?.y}, w=${box?.width}, h=${box?.height}`);
    
    await page.screenshot({ path: '/tmp/mobile-05-with-tree.png' });
  } else {
    console.log('❌ No tree nodes visible');
    
    // Check what's in the tree area
    const treeArea = page.locator('div[style*="display: block"]').filter({ has: page.locator('div') });
    const treeCount = await treeArea.count();
    console.log(`Found ${treeCount} visible div containers`);
    
    await page.screenshot({ path: '/tmp/mobile-05-no-tree.png' });
  }
  
  console.log('\n=== Keeping browser open for 10 seconds for inspection ===');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('Done! Check /tmp/mobile-*.png');
})();
