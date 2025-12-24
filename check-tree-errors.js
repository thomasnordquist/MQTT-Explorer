const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--kiosk', '--window-size=412,914'],
  });

  const page = await (await browser.newContext({ viewport: { width: 412, height: 914 } })).newPage();
  
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);

  console.log('Errors:', errors.length);
  errors.forEach((e, i) => console.log(`  ${i+1}. ${e.substring(0, 150)}`));

  // Check what's actually in the mobile tab content area
  const content = await page.evaluate(() => {
    const tabs = document.querySelector('[data-testid="mobile-tab-topics"]');
    if (!tabs) return { error: 'No tabs found' };
    
    const tabsParent = tabs.parentElement?.parentElement;
    if (!tabsParent) return { error: 'No tabs parent' };
    
    const contentArea = tabsParent.nextElementSibling;
    if (!contentArea) return { error: 'No content area' };
    
    return {
      contentAreaTag: contentArea.tagName,
      childCount: contentArea.children.length,
      innerHTML: contentArea.innerHTML.substring(0, 300),
    };
  });

  console.log('\nContent area:', JSON.stringify(content, null, 2));

  await browser.close();
})();
