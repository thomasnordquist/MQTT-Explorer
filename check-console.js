const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--kiosk', '--window-size=412,914'],
  });

  const page = await (await browser.newContext({ viewport: { width: 412, height: 914 } })).newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);

  const mobileLogs = logs.filter(l => l.includes('MOBILE') || l.includes('mobile'));
  console.log('Mobile-related logs:');
  mobileLogs.forEach(l => console.log('  ', l));

  const treeCount = await page.locator('[data-test-topic]').count();
  console.log('\nTree nodes:', treeCount);

  await browser.close();
})();
