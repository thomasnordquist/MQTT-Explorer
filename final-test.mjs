import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_PATH = '/tmp/mobile-scrolling-test.png';

async function test() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 914 },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  MQTT Explorer Mobile Horizontal Scrolling Test');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📱 Navigating to application...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check for saved connection
  let isConnected = false;
  
  // Try to detect if there's a saved connection that auto-connects
  const saveBtn = await page.locator('button:has-text("SAVE")').first();
  const saveBtnVisible = await saveBtn.isVisible().catch(() => false);

  if (saveBtnVisible) {
    console.log('Connection form detected, attempting to connect...');
    
    // Verify host is set to 127.0.0.1
    const hostInput = await page.locator('[data-testid="host-input"]').first();
    const hostValue = await hostInput.inputValue();
    console.log(`  Host: ${hostValue}`);

    // Click SAVE to establish connection
    await saveBtn.click();
    console.log('Clicked SAVE, waiting for connection...');
    
    // Wait for connection to establish
    await page.waitForTimeout(3000);
    
    // Check if connected
    const disconnectBtn = await page.locator('[data-testid="mobile-disconnect-button"]').first();
    isConnected = await disconnectBtn.isVisible().catch(() => false);
  } else {
    // Already connected
    isConnected = true;
  }

  if (isConnected) {
    console.log('✓ Connected to MQTT broker\n');
  } else {
    console.log('ℹ Connection status unclear, proceeding...\n');
  }

  // Click Topics tab
  console.log('Accessing Topics view...');
  const topicsTab = await page.locator('[data-testid="mobile-tab-topics"]').first();
  if (await topicsTab.isVisible().catch(() => false)) {
    await topicsTab.click();
    await page.waitForTimeout(500);
    console.log('✓ Topics tab clicked\n');
  }

  // Now find the tree container with scroll styling
  console.log('🔬 Analyzing topics container for horizontal scroll styling...\n');

  const scrollInfo = await page.evaluate(() => {
    // Look for the main tree/topics container
    const candidates = [
      document.querySelector('[class*="TreeView"]'),
      document.querySelector('[class*="tree-root"]'),
      document.querySelector('[class*="Topics"]'),
      document.querySelector('div[role="region"]'),
      ...Array.from(document.querySelectorAll('div')).filter(el => {
        const text = el.textContent;
        return text && text.length > 100 && el.offsetHeight > 200;
      }).slice(0, 5),
    ];

    for (const container of candidates) {
      if (!container) continue;
      
      const styles = window.getComputedStyle(container);
      const rect = container.getBoundingClientRect();
      
      if (rect.height > 100 && rect.width > 100) {
        return {
          selector: container.className || container.tagName,
          dataTestId: container.getAttribute('data-testid') || 'none',
          overflowX: styles.overflowX,
          overflowY: styles.overflowY,
          scrollSnapType: styles.scrollSnapType,
          width: container.offsetWidth,
          height: container.offsetHeight,
          scrollWidth: container.scrollWidth,
          hasScrollSnapAlign: Array.from(container.children).some(child => {
            const childStyles = window.getComputedStyle(child);
            return childStyles.scrollSnapAlign && childStyles.scrollSnapAlign !== 'none';
          }),
        };
      }
    }

    return null;
  });

  if (!scrollInfo) {
    console.log('⚠ Could not find topics container, inspecting all divs...\n');
    
    const allDivs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div')).slice(0, 20).map(el => ({
        class: el.className.substring(0, 60),
        width: el.offsetWidth,
        height: el.offsetHeight,
      }));
    });
    
    console.log('First 20 divs:');
    console.log(JSON.stringify(allDivs, null, 2));
  } else {
    console.log(`  Container: ${scrollInfo.selector}`);
    console.log(`  Dimensions: ${scrollInfo.width}x${scrollInfo.height}px`);
    console.log(`  Scrollable width: ${scrollInfo.scrollWidth}px`);
    console.log(`  overflowX: ${scrollInfo.overflowX}`);
    console.log(`  overflowY: ${scrollInfo.overflowY}`);
    console.log(`  scrollSnapType: ${scrollInfo.scrollSnapType}`);
    console.log(`  Has scroll-snap-aligned children: ${scrollInfo.hasScrollSnapAlign}\n`);

    // Run tests
    console.log('📊 Test Results:\n');
    
    const tests = [
      {
        name: 'overflowX is "auto"',
        passed: scrollInfo.overflowX === 'auto',
        expected: 'auto',
        actual: scrollInfo.overflowX,
      },
      {
        name: 'scrollSnapType contains "x"',
        passed: scrollInfo.scrollSnapType && scrollInfo.scrollSnapType.includes('x'),
        expected: 'contains "x"',
        actual: scrollInfo.scrollSnapType || 'none',
      },
      {
        name: 'Container is horizontally scrollable',
        passed: scrollInfo.scrollWidth > scrollInfo.width,
        expected: `scrollWidth (${scrollInfo.scrollWidth}) > width (${scrollInfo.width})`,
        actual: scrollInfo.scrollWidth > scrollInfo.width ? 'YES' : 'NO',
      },
    ];

    tests.forEach(test => {
      const icon = test.passed ? '✓' : '✗';
      console.log(`${icon} ${test.name}`);
      console.log(`  Expected: ${test.expected}`);
      console.log(`  Actual: ${test.actual}\n`);
    });

    const passedCount = tests.filter(t => t.passed).length;
    console.log(`Summary: ${passedCount}/${tests.length} tests passed`);
    
    if (passedCount === tests.length) {
      console.log('✓ Mobile horizontal scrolling is properly configured!');
    } else {
      console.log('✗ Some mobile horizontal scrolling properties are missing');
    }
  }

  console.log('\n📷 Taking screenshot...');
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  console.log(`✓ Screenshot saved to ${SCREENSHOT_PATH}`);

  console.log('\n═══════════════════════════════════════════════════════════\n');

  await browser.close();
}

test().catch(console.error);
