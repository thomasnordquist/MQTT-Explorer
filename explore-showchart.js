const { chromium } = require('playwright');
async function exploreShowChart() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        // Connect to the server
        console.log('Navigating to http://localhost:3000');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        // Wait for auto-connect to happen
        console.log('Waiting for auto-connect...');
        await page.waitForTimeout(5000);
        // Look for the topic tree
        console.log('Looking for topic tree...');
        // Expand the kitchen/coffee_maker topic to see the details
        console.log('Looking for kitchen topic...');
        const kitchenTopic = page.locator('[data-test-type="TreeItem"]').filter({ hasText: 'kitchen' }).first();
        if (await kitchenTopic.count() > 0) {
            console.log('Clicking kitchen topic');
            await kitchenTopic.click();
            await page.waitForTimeout(1000);
        }
        // Look for coffee_maker
        console.log('Looking for coffee_maker topic...');
        const coffeeMaker = page.locator('[data-test-type="TreeItem"]').filter({ hasText: 'coffee_maker' }).first();
        if (await coffeeMaker.count() > 0) {
            console.log('Clicking coffee_maker topic');
            await coffeeMaker.click();
            await page.waitForTimeout(2000);
        }
        // Now look for ShowChart elements
        console.log('\n=== Looking for ShowChart elements ===');
        const showChartElements = page.locator('[data-test-type="ShowChart"]');
        const count = await showChartElements.count();
        console.log(`Found ${count} ShowChart elements`);
        for (let i = 0; i < count; i++) {
            const element = showChartElements.nth(i);
            const testId = await element.getAttribute('data-test');
            const isVisible = await element.isVisible();
            const tagName = await element.evaluate(el => el.tagName);
            console.log(`\nElement ${i}:`);
            console.log(`  data-test: ${testId}`);
            console.log(`  visible: ${isVisible}`);
            console.log(`  tagName: ${tagName}`);
            // Get the outer HTML to see the structure
            const outerHTML = await element.evaluate(el => el.outerHTML.substring(0, 200));
            console.log(`  outerHTML: ${outerHTML}...`);
            // Try to check if it's clickable
            try {
                const box = await element.boundingBox();
                console.log(`  boundingBox: ${JSON.stringify(box)}`);
            }
            catch (e) {
                console.log(`  boundingBox: error - ${e.message}`);
            }
        }
        // Also look for temperature ShowChart specifically
        console.log('\n=== Looking for temperature ShowChart ===');
        const tempChart = page.locator('[data-test-type="ShowChart"][data-test="temperature"]');
        if (await tempChart.count() > 0) {
            const first = tempChart.first();
            console.log('Found temperature ShowChart!');
            console.log('Outer HTML:', await first.evaluate(el => el.outerHTML));
            // Check parent elements
            const parent = first.locator('..');
            console.log('Parent HTML:', await parent.evaluate(el => el.outerHTML.substring(0, 300)));
        }
        else {
            console.log('No temperature ShowChart found');
        }
        // Take a screenshot
        await page.screenshot({ path: '/tmp/showchart-exploration.png', fullPage: true });
        console.log('\nScreenshot saved to /tmp/showchart-exploration.png');
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await browser.close();
    }
}
exploreShowChart();
