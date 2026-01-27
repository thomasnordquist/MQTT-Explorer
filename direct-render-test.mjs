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
    await page.waitForTimeout(1000);

    // Inject test to analyze tree component styles directly
    console.log('🔍 Searching for tree component and its styles...\n');

    const treeAnalysis = await page.evaluate(() => {
      // Look for all divs that might be tree containers
      const allDivs = Array.from(document.querySelectorAll('div'));
      const treeContainers = [];

      for (const div of allDivs) {
        const styles = window.getComputedStyle(div);
        const classList = div.className;

        // Check if this looks like our tree container
        if ((styles.overflowX === 'auto' || styles.overflowX === 'scroll' ||
             styles.overflowY === 'auto' || styles.overflowY === 'scroll' ||
             (styles.scrollSnapType && styles.scrollSnapType !== 'none')) &&
            div.offsetHeight > 100 && div.offsetWidth > 100) {
          
          const children = Array.from(div.children);
          const childrenInfo = children.slice(0, 3).map(child => ({
            tag: child.tagName,
            hasText: child.textContent && child.textContent.length > 0,
            offsetHeight: child.offsetHeight,
          }));

          treeContainers.push({
            class: classList.substring(0, 100),
            overflowX: styles.overflowX,
            overflowY: styles.overflowY,
            scrollSnapType: styles.scrollSnapType,
            scrollBehavior: styles.scrollBehavior,
            width: div.offsetWidth,
            height: div.offsetHeight,
            scrollWidth: div.scrollWidth,
            childCount: children.length,
            firstChildren: childrenInfo,
          });
        }
      }

      return treeContainers;
    });

    console.log(`Found ${treeAnalysis.length} container(s) with scroll styling:`);
    
    if (treeAnalysis.length === 0) {
      console.log('⚠ No containers with scroll styling found on current page.\n');
      console.log('📌 Note: Tree component applies scroll styling only when:');
      console.log('   1. Browser width ≤ 768px (mobile detected)');
      console.log('   2. Tree data is present\n');
      
      // Check viewport
      const viewportInfo = await page.evaluate(() => {
        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          isMobileViewport: window.innerWidth <= 768,
        };
      });

      console.log(`Current viewport: ${viewportInfo.innerWidth}x${viewportInfo.innerHeight}`);
      console.log(`Mobile viewport detected: ${viewportInfo.isMobileViewport}\n`);

      // Check for tree component in DOM
      const treeComponentExists = await page.evaluate(() => {
        // Look for any div with class suggesting it's a tree
        const possibleTrees = document.querySelectorAll('[class*="tree"], [class*="Tree"], [class*="topics"], [class*="Topics"]');
        return Array.from(possibleTrees).length > 0;
      });

      console.log(`Tree-like elements found: ${treeComponentExists ? 'YES' : 'NO'}\n`);

      if (!viewportInfo.isMobileViewport) {
        console.log('⚠ Viewport is NOT in mobile range! Tree is likely showing desktop layout.');
      }
    } else {
      console.log(JSON.stringify(treeAnalysis, null, 2));
    }

    console.log('\n📋 Summary of Expected Mobile CSS Properties:');
    console.log('When rendered in mobile viewport (≤768px):');
    console.log('  ✓ overflowX should be: auto');
    console.log('  ✓ overflowY should be: scroll');
    console.log('  ✓ scrollSnapType should be: x mandatory');
    console.log('  ✓ WebkitOverflowScrolling should be: touch');
    console.log('  ✓ Child wrapper should have: scrollSnapAlign: start\n');

    console.log('📷 Taking screenshot of current state...');
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
    console.log(`✓ Screenshot saved to ${SCREENSHOT_PATH}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n═══════════════════════════════════════════════════════════\n');
    await browser.close();
  }
}

test();
