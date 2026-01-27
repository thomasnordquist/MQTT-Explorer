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

  try {
    console.log('📱 Navigating to application...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('✓ Page loaded\n');

    // Wait for form or auto-connect
    console.log('⏳ Waiting for connection or connection form...');
    
    // Check for connection form
    const saveBtn = await page.locator('button:has-text("SAVE")').first();
    const saveBtnVisible = await saveBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (saveBtnVisible) {
      console.log('  Connection form found, submitting connection...');
      await saveBtn.click();
      
      // Wait for modal to close or connection to establish
      await page.waitForFunction(() => {
        const modal = document.querySelector('[role="presentation"] .MuiModal-root');
        return !modal || !modal.offsetHeight;
      }, { timeout: 10000 }).catch(() => console.log('  (Modal may still be present)'));
      
      await page.waitForTimeout(2000);
    }

    // Now check if connected and look for topics
    console.log('\n🔍 Checking for topics display...');
    
    // Find the topics panel/container
    const topicsPanel = await page.locator('[id*="tabpanel"][role="tabpanel"]').first();
    const panelVisible = await topicsPanel.isVisible().catch(() => false);

    if (panelVisible) {
      console.log('✓ Topics panel is visible\n');
    } else {
      console.log('ℹ No visible tabpanel found, searching for tree container...\n');
    }

    // Analyze the main content area for scroll properties
    console.log('🔬 Analyzing scroll properties on main content...\n');

    const scrollInfo = await page.evaluate(() => {
      // Get all main containers in the DOM
      const candidates = [
        // MUI Drawer with tree content
        document.querySelector('.MuiDrawer-paper'),
        // Tab panels
        document.querySelector('[role="tabpanel"]'),
        // Main content areas
        ...Array.from(document.querySelectorAll('main, [role="main"], .MuiBox-root')).filter(el => 
          el.offsetHeight > 100 && el.offsetWidth > 100
        ).slice(0, 5),
      ];

      for (const container of candidates) {
        if (!container) continue;
        
        const styles = window.getComputedStyle(container);
        const rect = container.getBoundingClientRect();
        
        // Log all containers with scroll properties
        if (styles.overflowX !== 'visible' || styles.overflowY !== 'visible' || 
            (styles.scrollSnapType && styles.scrollSnapType !== 'none')) {
          
          return {
            tag: container.tagName,
            selector: container.className.substring(0, 80),
            dataTestId: container.getAttribute('data-testid') || 'none',
            overflowX: styles.overflowX,
            overflowY: styles.overflowY,
            scrollSnapType: styles.scrollSnapType,
            scrollBehavior: styles.scrollBehavior,
            width: container.offsetWidth,
            height: container.offsetHeight,
            scrollWidth: container.scrollWidth,
            scrollHeight: container.scrollHeight,
            hasChildren: container.children.length,
          };
        }
      }

      // If nothing found with explicit scroll, return main drawer
      const drawer = document.querySelector('.MuiDrawer-paper');
      if (drawer) {
        const styles = window.getComputedStyle(drawer);
        return {
          tag: 'MuiDrawer',
          selector: 'MuiDrawer-paper',
          overflowX: styles.overflowX,
          overflowY: styles.overflowY,
          scrollSnapType: styles.scrollSnapType,
          width: drawer.offsetWidth,
          height: drawer.offsetHeight,
          scrollWidth: drawer.scrollWidth,
          hasChildren: drawer.children.length,
          note: 'Drawer found but no explicit scroll on main content'
        };
      }

      return { error: 'No scrollable container found' };
    });

    console.log('Container Details:');
    console.log(JSON.stringify(scrollInfo, null, 2));
    console.log();

    // Perform tests if we have container info
    if (!scrollInfo.error) {
      console.log('📊 CSS Property Tests:\n');
      
      const tests = [];
      
      // Test 1: overflowX
      const overflowXTest = {
        name: 'Container has overflowX property',
        passed: scrollInfo.overflowX === 'auto' || scrollInfo.overflowX === 'scroll',
        expected: 'auto or scroll',
        actual: scrollInfo.overflowX,
      };
      tests.push(overflowXTest);

      // Test 2: scrollSnapType
      const scrollSnapTest = {
        name: 'Container has horizontal scroll-snap enabled',
        passed: scrollInfo.scrollSnapType && scrollInfo.scrollSnapType.includes('x'),
        expected: 'contains "x"',
        actual: scrollInfo.scrollSnapType || 'none',
      };
      tests.push(scrollSnapTest);

      // Test 3: Horizontal scrollability
      const scrollableTest = {
        name: 'Container is horizontally scrollable',
        passed: scrollInfo.scrollWidth > scrollInfo.width,
        expected: `scrollWidth (${scrollInfo.scrollWidth}px) > width (${scrollInfo.width}px)`,
        actual: scrollInfo.scrollWidth > scrollInfo.width ? 'YES' : 'NO',
      };
      tests.push(scrollableTest);

      tests.forEach(test => {
        const icon = test.passed ? '✓' : '✗';
        console.log(`${icon} ${test.name}`);
        console.log(`  Expected: ${test.expected}`);
        console.log(`  Actual: ${test.actual}\n`);
      });

      const passedCount = tests.filter(t => t.passed).length;
      const totalCount = tests.length;
      console.log(`═══════════════════════════════════════════════════════════`);
      console.log(`Summary: ${passedCount}/${totalCount} tests passed`);
      
      if (passedCount === totalCount) {
        console.log('✓ Mobile horizontal scrolling is PROPERLY CONFIGURED!');
      } else if (passedCount === 0) {
        console.log('✗ No mobile horizontal scrolling properties detected');
      } else {
        console.log('⚠ Partial implementation - some properties are missing');
      }
    } else {
      console.log('⚠ Could not analyze - container structure different from expected');
    }

    console.log('\n📷 Taking screenshot...');
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
    console.log(`✓ Screenshot saved to ${SCREENSHOT_PATH}`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    console.log('\n═══════════════════════════════════════════════════════════\n');
    await browser.close();
  }
}

test();
