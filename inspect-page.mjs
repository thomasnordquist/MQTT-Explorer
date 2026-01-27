import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function inspect() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 914 },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Close modal
  const cancelBtn = await page.locator('button:has-text("CANCEL")').first();
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click();
    await page.waitForTimeout(500);
  }

  // Get all elements with data-testid
  const allTestIds = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid]');
    return Array.from(elements).map(el => ({
      testId: el.getAttribute('data-testid'),
      tag: el.tagName,
      visible: el.offsetHeight > 0 && el.offsetWidth > 0,
      width: el.offsetWidth,
      height: el.offsetHeight,
    })).slice(0, 20);
  });

  console.log('Elements with data-testid:');
  console.log(JSON.stringify(allTestIds, null, 2));

  // Get all containers with overflow
  const scrollContainers = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const containers = [];
    for (let el of all) {
      if (el.offsetHeight > 50 && el.offsetWidth > 0) {
        const styles = window.getComputedStyle(el);
        if (styles.overflowX !== 'visible' || styles.overflowY !== 'visible' || 
            (styles.scrollSnapType && styles.scrollSnapType !== 'none')) {
          containers.push({
            tag: el.tagName,
            class: el.className,
            overflowX: styles.overflowX,
            overflowY: styles.overflowY,
            scrollSnapType: styles.scrollSnapType,
            width: el.offsetWidth,
            height: el.offsetHeight,
          });
        }
      }
    }
    return containers.slice(0, 10);
  });

  console.log('\nContainers with scroll styling:');
  console.log(JSON.stringify(scrollContainers, null, 2));

  await browser.close();
}

inspect();
