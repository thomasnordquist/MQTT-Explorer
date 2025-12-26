import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 914 }  // Mobile viewport
  });
  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take a screenshot
  await page.screenshot({ path: '/tmp/mobile-screenshot.png', fullPage: true });
  console.log('Screenshot saved to /tmp/mobile-screenshot.png');
  
  // Check for Settings button/icon
  const settingsButtons = await page.locator('[aria-label*="Settings"], [aria-label*="settings"], [data-testid*="settings"]').all();
  console.log(`Found ${settingsButtons.length} settings buttons`);
  
  // Look for any button or icon that might open settings
  const allButtons = await page.locator('button').all();
  console.log(`Total buttons on page: ${allButtons.length}`);
  
  // Try to find and click settings/menu button
  try {
    // Look for common menu/settings patterns
    const menuButton = page.locator('button[aria-label="Menu"], button[aria-label="Settings"], button:has(svg)').first();
    await menuButton.waitFor({ timeout: 5000 });
    console.log('Found menu button, clicking...');
    await menuButton.click();
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('Could not find menu button:', (e as Error).message);
  }
  
  // Now check for Host input field using various selectors
  console.log('\n=== Checking for Host input field ===');
  
  const selectors = [
    '//label[contains(text(), "Host")]/..//input',
    '[data-testid="host-input"]',
    'input[name="host"]',
    'input[placeholder*="host" i]',
    'input[type="text"]'
  ];
  
  for (const selector of selectors) {
    try {
      const elements = await page.locator(selector).all();
      console.log(`Selector "${selector}": ${elements.length} elements found`);
      
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          const visible = await elements[i].isVisible();
          const value = await elements[i].inputValue().catch(() => 'N/A');
          const placeholder = await elements[i].getAttribute('placeholder').catch(() => 'N/A');
          console.log(`  Element ${i}: visible=${visible}, value="${value}", placeholder="${placeholder}"`);
        }
      }
    } catch (e) {
      console.log(`Selector "${selector}": Error - ${(e as Error).message}`);
    }
  }
  
  // Get page HTML snapshot to see the structure
  console.log('\n=== Getting page structure ===');
  const bodyHTML = await page.locator('body').innerHTML();
  const hasConnectionSetup = bodyHTML.includes('Connection') || bodyHTML.includes('Host');
  console.log(`Page contains "Connection" or "Host": ${hasConnectionSetup}`);
  
  // Print visible text on the page
  const visibleText = await page.locator('body').innerText();
  console.log('\n=== Visible text on page ===');
  console.log(visibleText.substring(0, 1000));
  
  // Check what elements are actually visible
  console.log('\n=== Looking for specific elements ===');
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  console.log(`Found ${headings.length} headings`);
  for (const heading of headings) {
    const visible = await heading.isVisible();
    if (visible) {
      const text = await heading.innerText();
      console.log(`  Heading: "${text}"`);
    }
  }
  
  // Check for MobileConnectionSelector
  const mobileSelector = await page.locator('[class*="MobileConnectionSelector"], [class*="ConnectionSelector"]').all();
  console.log(`Found ${mobileSelector.length} connection selector elements`);
  
  // Check for any Select elements
  const selects = await page.locator('select, [role="combobox"], [role="listbox"]').all();
  console.log(`Found ${selects.length} select/combobox elements`);
  
  // Check if there's a dialog or modal
  const dialogs = await page.locator('[role="dialog"], .MuiDialog-root').all();
  console.log(`\nNumber of dialogs/modals: ${dialogs.length}`);
  
  if (dialogs.length > 0) {
    console.log('Found dialog(s), checking content...');
    for (let i = 0; i < dialogs.length; i++) {
      const dialogVisible = await dialogs[i].isVisible();
      if (dialogVisible) {
        const dialogHTML = await dialogs[i].innerHTML();
        console.log(`Dialog ${i}: visible=true`);
        console.log(`Dialog HTML (first 1000 chars): ${dialogHTML.substring(0, 1000)}`);
      } else {
        console.log(`Dialog ${i}: visible=false (skipping content)`);
      }
    }
  }
  
  // Look for drawer or side panels
  const drawers = await page.locator('[class*="Drawer"], [role="navigation"]').all();
  console.log(`\nFound ${drawers.length} drawer/navigation elements`);
  
  await browser.close();
})();
