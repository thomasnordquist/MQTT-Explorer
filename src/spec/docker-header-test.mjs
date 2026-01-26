/**
 * Test to verify Docker blank page fix
 * Tests that Origin-Agent-Cluster and other problematic headers are disabled
 */
import { chromium } from 'playwright';

async function testHeaders(url, testName) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Test: ${testName}`);
  console.log(`URL: ${url}`);
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });

    if (!response) {
      throw new Error('No response received');
    }

    const status = response.status();
    const headers = response.headers();

    console.log(`\nResponse Status: ${status}`);
    console.log('\nSecurity Headers Check:');
    console.log('------------------------');
    
    const headerChecks = {
      'origin-agent-cluster': headers['origin-agent-cluster'],
      'cross-origin-embedder-policy': headers['cross-origin-embedder-policy'],
      'cross-origin-opener-policy': headers['cross-origin-opener-policy'],
      'cross-origin-resource-policy': headers['cross-origin-resource-policy'],
    };

    let allHeadersDisabled = true;
    for (const [headerName, value] of Object.entries(headerChecks)) {
      const isDisabled = !value || value === 'undefined';
      const statusSymbol = isDisabled ? '✓' : '✗';
      console.log(`  ${statusSymbol} ${headerName}: ${value || '(not set - GOOD)'}`);
      if (!isDisabled) {
        allHeadersDisabled = false;
      }
    }

    // Wait for app to load
    await page.waitForSelector('#app', { timeout: 5000 });
    const appContent = await page.locator('#app').innerHTML();
    const hasContent = appContent.length > 100;

    console.log(`\nPage Content Check:`);
    console.log(`  App div content length: ${appContent.length} characters`);
    console.log(`  ${hasContent ? '✓' : '✗'} Page has content (> 100 chars)`);

    // Check for Origin-Agent-Cluster errors
    const originErrors = consoleErrors.filter(err => 
      err.toLowerCase().includes('origin') || 
      err.toLowerCase().includes('agent') || 
      err.toLowerCase().includes('cluster')
    );

    if (originErrors.length > 0) {
      console.log('\n✗ Console Errors Found:');
      originErrors.forEach(err => console.log(`    ${err}`));
    } else {
      console.log('\n✓ No Origin-Agent-Cluster errors in console');
    }

    const testPassed = 
      status === 200 &&
      allHeadersDisabled &&
      hasContent &&
      originErrors.length === 0;

    if (testPassed) {
      console.log('\n✅ TEST PASSED - Page loads correctly without problematic headers');
    } else {
      console.log('\n❌ TEST FAILED');
      if (!allHeadersDisabled) {
        console.log('   Reason: Some cross-origin headers are still enabled');
      }
      if (!hasContent) {
        console.log('   Reason: Page is blank or has no content');
      }
      if (originErrors.length > 0) {
        console.log('   Reason: Console errors related to origin/agent/cluster');
      }
    }

    await browser.close();
    return testPassed;

  } catch (error) {
    console.log(`\n❌ TEST FAILED - Error: ${error.message}`);
    await browser.close();
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('Docker Blank Page Fix - Header Verification Test');
  console.log('='.repeat(70));
  console.log('\nThis test verifies that problematic helmet headers are disabled:');
  console.log('  - Origin-Agent-Cluster');
  console.log('  - Cross-Origin-Embedder-Policy');
  console.log('  - Cross-Origin-Opener-Policy');
  console.log('  - Cross-Origin-Resource-Policy');
  console.log('\nThese headers cause blank pages when accessing via IP vs localhost.');

  const results = [];

  // Test with localhost
  results.push(await testHeaders('http://localhost:3000', 'Access via localhost'));

  // Test with 127.0.0.1 (different origin)
  results.push(await testHeaders('http://127.0.0.1:3000', 'Access via 127.0.0.1 (different origin)'));

  console.log('\n' + '='.repeat(70));
  console.log('FINAL TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`Localhost test:  ${results[0] ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`127.0.0.1 test:  ${results[1] ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = results.every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 SUCCESS! The Docker blank page fix works correctly.');
    console.log('   - All problematic headers are disabled');
    console.log('   - Page loads correctly from both localhost and 127.0.0.1');
    console.log('   - No console errors related to origin-agent-cluster');
    process.exit(0);
  } else {
    console.log('\n❌ FAILURE! Some tests did not pass.');
    process.exit(1);
  }
}

main();
