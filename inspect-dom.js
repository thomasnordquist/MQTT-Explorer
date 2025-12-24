const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--kiosk', '--window-size=412,914'],
  });

  const page = await (await browser.newContext({ viewport: { width: 412, height: 914 } })).newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);

  // Get the full body HTML structure (limited)
  const structure = await page.evaluate(() => {
    const getStructure = (el, depth = 0) => {
      if (depth > 4) return '...';
      const tag = el.tagName;
      const classes = el.className ? `.${el.className.split(' ').slice(0, 2).join('.')}` : '';
      const id = el.id ? `#${el.id}` : '';
      const testId = el.getAttribute('data-testid') ? `[${el.getAttribute('data-testid')}]` : '';
      const children = Array.from(el.children).slice(0, 5);
      const childStr = children.length > 0 ? '\n' + children.map(c => '  '.repeat(depth + 1) + getStructure(c, depth + 1)).join('\n') : '';
      return `${tag}${id}${classes}${testId}${childStr}`;
    };
    
    // Find the main content div
    const app = document.getElementById('app');
    return getStructure(app);
  });

  console.log(structure);

  await browser.close();
})();
