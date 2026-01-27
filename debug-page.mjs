import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function debug() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 914, deviceScaleFactor: 2.75 },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Close any modal
  const cancelBtn = await page.locator('button:has-text("CANCEL")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click();
    await page.waitForTimeout(500);
  }

  // Get page structure
  const html = await page.content();
  const lines = html.split('\n');
  
  // Find lines with data-testid or class attributes
  const relevantLines = lines.filter(line => 
    line.includes('data-testid') || 
    line.includes('TreeView') || 
    line.includes('topics') ||
    line.includes('tabpanel')
  ).slice(0, 30);

  console.log('Page structure (relevant elements):');
  relevantLines.forEach(line => console.log(line.trim()));

  // Also dump full HTML to file for inspection
  require('fs').writeFileSync('/tmp/page-dump.html', html);
  console.log('\nFull HTML saved to /tmp/page-dump.html');

  await browser.close();
}

debug();
