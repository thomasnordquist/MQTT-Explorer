import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function check() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 914 },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Look for connection status
  const disconnectButton = await page.locator('[data-testid="mobile-disconnect-button"]').first();
  const disconnectVisible = await disconnectButton.isVisible().catch(() => false);

  console.log('Disconnect button visible:', disconnectVisible);

  if (disconnectVisible) {
    console.log('Already connected! Topics should be visible.');
    
    // Click on topics tab to ensure we're viewing topics
    const topicsTab = await page.locator('[data-testid="mobile-tab-topics"]').first();
    await topicsTab.click();
    await page.waitForTimeout(1000);

    // Now check for topics tree
    const allElements = await page.evaluate(() => {
      const trees = document.querySelectorAll('[class*="tree"], [class*="Tree"]');
      return Array.from(trees).map(el => ({
        tag: el.tagName,
        class: el.className,
        visible: el.offsetHeight > 0 && el.offsetWidth > 0,
        width: el.offsetWidth,
        height: el.offsetHeight,
        scrollWidth: el.scrollWidth,
        textContent: el.textContent.substring(0, 50),
      }));
    });

    console.log('Tree elements found:', allElements.length);
    console.log(JSON.stringify(allElements, null, 2));
  } else {
    console.log('Not connected yet, connection form is visible');
    
    // Try to connect using the form
    console.log('Attempting to set up connection...');
    
    // Fill the host field if needed
    const hostInput = await page.locator('[data-testid="host-input"]').first();
    const hostValue = await hostInput.inputValue();
    console.log('Current host value:', hostValue);
    
    if (!hostValue || hostValue === '127.0.0.1') {
      console.log('Host already set to 127.0.0.1, clicking SAVE...');
      const saveBtn = await page.locator('button:has-text("SAVE")').first();
      await saveBtn.click();
      await page.waitForTimeout(2000);
      
      // Check if now connected
      const disconnectNow = await page.locator('[data-testid="mobile-disconnect-button"]').first();
      if (await disconnectNow.isVisible().catch(() => false)) {
        console.log('Successfully connected!');
        
        const topicsTab = await page.locator('[data-testid="mobile-tab-topics"]').first();
        await topicsTab.click();
        await page.waitForTimeout(1000);

        const trees = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('[class*="tree"], [class*="Tree"]')).map(el => ({
            class: el.className,
            visible: el.offsetHeight > 0,
            width: el.offsetWidth,
            height: el.offsetHeight,
            scrollWidth: el.scrollWidth,
          }));
        });
        
        console.log('Topics after connection:');
        console.log(JSON.stringify(trees, null, 2));
      }
    }
  }

  await browser.close();
}

check();
