const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--kiosk', '--window-size=412,914'],
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 914 },
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Close any backdrop
  const backdrop = page.locator('.MuiBackdrop-root');
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: '/tmp/final-01-loaded.png' });

  // Click DISCONNECT if visible
  const disconnectBtn = page.locator('button').filter({ hasText: /DISCONNECT/ });
  if (await disconnectBtn.isVisible().catch(() => false)) {
    console.log('Disconnecting...');
    await disconnectBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/final-02-disconnected.png' });
  }

  // Now connect
  const hostInput = page.locator('input[name="host"]');
  if (await hostInput.isVisible().catch(() => false)) {
    console.log('Connecting to 127.0.0.1...');
    await hostInput.fill('127.0.0.1');
    await page.locator('button:has-text("CONNECT")').click();
    await page.waitForTimeout(10000);
    await page.screenshot({ path: '/tmp/final-03-connected.png' });
  }

  // Check tree
  const count = await page.locator('[data-test-topic]').count();
  console.log(`Tree nodes: ${count}`);

  if (count > 0) {
    console.log('✅ TREE VISIBLE');
    const box = await page.locator('[data-test-topic]').first().boundingBox();
    console.log(`Position: (${box?.x}, ${box?.y}), Size: ${box?.width}x${box?.height}`);
  } else {
    console.log('❌ NO TREE NODES');
  }

  await page.screenshot({ path: '/tmp/final-04-result.png' });
  await browser.close();
  process.exit(count > 0 ? 0 : 1);
})();
