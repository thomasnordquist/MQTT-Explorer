import { chromium } from 'playwright';

async function main() {
  // Start Xvfb
  console.log('Starting application...');
  
  const browser = await chromium.launch({
    executablePath: '/home/runner/work/MQTT-Explorer/MQTT-Explorer/node_modules/electron/dist/electron',
    args: ['.', '--enable-mcp-introspection', '--no-sandbox'],
    env: { ...process.env, DISPLAY: ':99' }
  });
  
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();
  
  // Collect console messages
  const messages = [];
  page.on('console', msg => {
    messages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // Collect page errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
  });
  
  // Wait for the page to load
  await page.waitForTimeout(8000);
  
  console.log('\n=== CONSOLE MESSAGES ===');
  const errorMessages = messages.filter(m => m.type === 'error');
  const warningMessages = messages.filter(m => m.type === 'warning');
  
  if (errorMessages.length > 0) {
    console.log('\nERRORS:');
    errorMessages.forEach(msg => {
      console.log(`  [${msg.type}] ${msg.text}`);
      if (msg.location) {
        console.log(`    at ${msg.location.url}:${msg.location.lineNumber}`);
      }
    });
  } else {
    console.log('No console errors!');
  }
  
  if (warningMessages.length > 0) {
    console.log('\nWARNINGS:');
    warningMessages.forEach(msg => {
      console.log(`  [${msg.type}] ${msg.text}`);
    });
  }
  
  console.log('\n=== PAGE ERRORS ===');
  if (errors.length === 0) {
    console.log('No page errors found! ✅');
  } else {
    errors.forEach(err => {
      console.log(`ERROR: ${err.message}`);
      if (err.stack) {
        console.log(err.stack);
      }
    });
  }
  
  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
