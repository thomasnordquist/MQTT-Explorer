const { chromium } = require('playwright');
const mqtt = require('mqtt');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--kiosk', '--window-size=412,914'],
  });

  const page = await (await browser.newContext({ viewport: { width: 412, height: 914 } })).newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);

  // Publish messages
  const client = mqtt.connect('mqtt://127.0.0.1:1883');
  await new Promise((resolve) => {
    client.on('connect', () => {
      client.publish('test/topic1', 'message1');
      client.publish('test/topic2', 'message2');
      client.publish('home/bedroom/temp', '21.5');
      setTimeout(() => {
        client.end();
        resolve();
      }, 1000);
    });
  });

  console.log('Published messages');
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: '/tmp/final-tree.png' });

  // Check for tree nodes
  const count = await page.locator('[data-test-topic]').count();
  console.log('Tree nodes:', count);

  // Check for any div with tabindex=0 and overflow=scroll
  const treeDiv = await page.evaluate(() => {
    const div = Array.from(document.querySelectorAll('div[tabindex="0"]')).find(d =>
      window.getComputedStyle(d).overflowY === 'scroll'
    );
    if (!div) return null;
    
    const style = window.getComputedStyle(div);
    return {
      height: style.height,
      width: style.width,
      childCount: div.children.length,
      innerHTML: div.innerHTML.substring(0, 200),
    };
  });

  console.log('Tree div:', JSON.stringify(treeDiv, null, 2));

  await browser.close();
  process.exit(count > 0 ? 0 : 1);
})();
