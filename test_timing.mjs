import { chromium } from 'playwright';

async function testTiming() {
  console.log('Connecting to Chrome DevTools Protocol...');
  
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0];
    
    if (!page) {
      console.log('❌ No page found - electron may not have loaded yet');
      await browser.close();
      return;
    }
    
    console.log('✅ Connected to page');
    
    // Set up error listeners BEFORE waiting
    const errors = [];
    const consoleErrors = [];
    
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR CAPTURED] ${error.message}`);
      errors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[CONSOLE ERROR CAPTURED] ${msg.text()}`);
        consoleErrors.push(msg.text());
      }
    });
    
    console.log('Waiting for errors to appear...');
    
    // Wait different durations to see when errors appear
    for (let i = 1; i <= 10; i++) {
      await page.waitForTimeout(1000);
      console.log(`After ${i}s: ${errors.length} page errors, ${consoleErrors.length} console errors`);
    }
    
    console.log('\n=== FINAL RESULTS ===');
    console.log(`Total page errors: ${errors.length}`);
    console.log(`Total console errors: ${consoleErrors.length}`);
    
    if (errors.length > 0) {
      console.log('\nPage errors:');
      errors.forEach(e => console.log('  -', e));
    }
    
    if (consoleErrors.length > 0) {
      console.log('\nConsole errors:');
      consoleErrors.forEach(e => console.log('  -', e));
    }
    
    await browser.close();
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

testTiming();
