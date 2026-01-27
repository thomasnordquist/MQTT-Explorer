#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PIXEL_6_VIEWPORT = {
  width: 412,
  height: 914,
  deviceScaleFactor: 2.75,
};

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_PATH = '/tmp/mobile-scrolling-test.png';

// Helper function to log test results
function logTestResult(testName, passed, message = '') {
  const icon = passed ? '✓' : '✗';
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${icon} [${status}] ${testName}`);
  if (message) {
    console.log(`  └─ ${message}`);
  }
}

async function runTest() {
  let browser;
  const results = {
    tests: [],
    timestamp: new Date().toISOString(),
    success: true,
  };

  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  MQTT Explorer Mobile Horizontal Scrolling Test');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Launch browser
    console.log(`📱 Launching browser with Pixel 6 viewport (${PIXEL_6_VIEWPORT.width}x${PIXEL_6_VIEWPORT.height})...`);
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: PIXEL_6_VIEWPORT,
      userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36',
    });
    const page = await context.newPage();

    // Navigate to app
    console.log(`🌐 Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Page loaded\n');

    // Wait for connection and auto-connect
    console.log('⏳ Waiting for MQTT connection...');
    
    // Check if there's a connection modal and close it if present
    const cancelBtn = await page.locator('button:has-text("CANCEL")').first();
    const cancelBtnVisible = await cancelBtn.isVisible().catch(() => false);
    
    if (cancelBtnVisible) {
      console.log('  Closing connection setup modal...');
      await cancelBtn.click();
      await page.waitForTimeout(1000);
    }
    
    try {
      await page.waitForSelector('[data-testid="connection-status-connected"]', { timeout: 5000 }).catch(() => {
        console.log('  (No connection status indicator found, checking if page is interactive)');
      });
    } catch (e) {
      console.log('  (Continuing despite no connection indicator)');
    }

    // Small delay to ensure page is fully rendered
    await page.waitForTimeout(2000);

    // Check if we're in mobile mode - look for the Topics tab
    console.log('\n🔍 Checking for mobile UI elements...');
    const topicsTab = await page.locator('[data-testid="mobile-tab-topics"], [data-testid="tab-topics"], [role="tab"]:has-text("Topics")').first();
    const topicsTabExists = await topicsTab.isVisible().catch(() => false);

    if (topicsTabExists) {
      console.log('✓ Topics tab found, clicking to ensure topics are visible...');
      // Use force click to bypass modal interception
      await topicsTab.click({ force: true });
      await page.waitForTimeout(500);
    } else {
      console.log('ℹ Topics tab not found, page structure may differ');
    }

    // Find the tree/topics container
    console.log('\n📋 Locating topics container...');
    let treeContainer = await page.locator('[data-testid="topics-tree"], [class*="TreeView"], main').first();
    
    if (!await treeContainer.isVisible().catch(() => false)) {
      console.log('  └─ Primary selector not found, searching for any scrollable container...');
      // Get all potentially scrollable elements
      const allElements = await page.locator('*').all();
      for (const elem of allElements.slice(0, 50)) {
        const isVisible = await elem.isVisible().catch(() => false);
        if (isVisible) {
          const boundingBox = await elem.boundingBox().catch(() => null);
          if (boundingBox && boundingBox.width > 0 && boundingBox.height > 100) {
            treeContainer = elem;
            break;
          }
        }
      }
    }

    if (!await treeContainer.isVisible().catch(() => false)) {
      throw new Error('Could not find topics tree container');
    }

    console.log('✓ Topics container located\n');

    // Get computed styles for the container
    console.log('🔬 Analyzing CSS properties...');
    const computedStyles = await page.evaluate(() => {
      // First, try to find all containers with potential scroll styling
      const allContainers = Array.from(document.querySelectorAll('[class*="scroll"], [class*="tree"], [class*="Tree"], [data-testid*="topic"]'));
      
      console.log('Found containers:', allContainers.length);
      
      const containers = [
        document.querySelector('[data-testid="topics-tree"]'),
        document.querySelector('[data-testid="mobile-tabpanel-0"]'),
        document.querySelector('[class*="TreeView"]'),
        document.querySelector('main'),
        ...allContainers,
      ];

      // Find the best container - one with content and scrolling capabilities
      for (const container of containers) {
        if (!container) continue;
        
        const styles = window.getComputedStyle(container);
        const isScrollable = styles.overflowX === 'auto' || styles.overflowX === 'scroll' ||
                            styles.overflowY === 'auto' || styles.overflowY === 'scroll' ||
                            (styles.scrollSnapType && styles.scrollSnapType !== 'none');
        
        // Return first container with scroll styling, or any visible container with content
        if (isScrollable || (container.offsetHeight > 100 && container.offsetWidth > 0 && container.children.length > 0)) {
          return {
            selector: container.className || container.tagName,
            dataTestId: container.getAttribute('data-testid') || 'none',
            overflowX: styles.overflowX,
            overflowY: styles.overflowY,
            scrollSnapType: styles.scrollSnapType,
            width: container.offsetWidth,
            height: container.offsetHeight,
            scrollWidth: container.scrollWidth,
            hasContent: container.children.length > 0,
            isScrollable: isScrollable,
          };
        }
      }

      return null;
    });

    if (!computedStyles) {
      throw new Error('No visible container found with scroll capabilities');
    }

    console.log(`  Container: ${computedStyles.selector}`);
    console.log(`  Dimensions: ${computedStyles.width}x${computedStyles.height} (scroll width: ${computedStyles.scrollWidth})`);
    console.log(`  overflowX: ${computedStyles.overflowX}`);
    console.log(`  overflowY: ${computedStyles.overflowY}`);
    console.log(`  scrollSnapType: ${computedStyles.scrollSnapType}\n`);

    // Test 1: Check for overflowX auto
    const hasOverflowXAuto = computedStyles.overflowX === 'auto';
    logTestResult('overflowX is "auto"', hasOverflowXAuto, `Found: ${computedStyles.overflowX}`);
    results.tests.push({
      name: 'overflowX is "auto"',
      passed: hasOverflowXAuto,
      expected: 'auto',
      actual: computedStyles.overflowX,
    });

    // Test 2: Check for scrollSnapType containing 'x'
    const hasScrollSnapTypeX = computedStyles.scrollSnapType && computedStyles.scrollSnapType.includes('x');
    logTestResult('scrollSnapType contains "x"', hasScrollSnapTypeX, `Found: ${computedStyles.scrollSnapType}`);
    results.tests.push({
      name: 'scrollSnapType contains "x"',
      passed: hasScrollSnapTypeX,
      expected: 'contains "x"',
      actual: computedStyles.scrollSnapType || 'none',
    });

    // Test 3: Check for horizontal scrollability
    const isHorizontallyScrollable = computedStyles.scrollWidth > computedStyles.width;
    logTestResult('Container is horizontally scrollable', isHorizontallyScrollable, 
      `Scroll width (${computedStyles.scrollWidth}) > visible width (${computedStyles.width})`);
    results.tests.push({
      name: 'Container is horizontally scrollable',
      passed: isHorizontallyScrollable,
      expected: `scrollWidth > width`,
      actual: `${computedStyles.scrollWidth} > ${computedStyles.width}`,
    });

    // Take screenshot
    console.log('\n📷 Taking screenshot...');
    await page.screenshot({ path: SCREENSHOT_PATH });
    console.log(`✓ Screenshot saved to ${SCREENSHOT_PATH}`);

    // Set overall success
    results.success = results.tests.every(t => t.passed);
    results.screenshotPath = SCREENSHOT_PATH;

    // Print summary
    console.log('\n═══════════════════════════════════════════════════════════');
    const passedCount = results.tests.filter(t => t.passed).length;
    const totalCount = results.tests.length;
    console.log(`📊 Test Results: ${passedCount}/${totalCount} passed\n`);

    if (results.success) {
      console.log('✓ All tests PASSED - Mobile horizontal scrolling is properly configured!');
    } else {
      console.log('✗ Some tests FAILED - Mobile horizontal scrolling may not be working correctly');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    await context.close();
    return results;

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    results.success = false;
    results.error = error.message;
    results.errorStack = error.stack;

    // Try to take a screenshot anyway for debugging
    try {
      const screenshots = await browser?.contexts()[0]?.pages() || [];
      if (screenshots.length > 0) {
        await screenshots[0].screenshot({ path: SCREENSHOT_PATH });
        console.log(`Debug screenshot saved to ${SCREENSHOT_PATH}`);
      }
    } catch (e) {
      console.log('Could not capture debug screenshot');
    }

    return results;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runTest().then(results => {
  console.log('\n📋 Detailed Results:');
  console.log(JSON.stringify(results, null, 2));
  process.exit(results.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
