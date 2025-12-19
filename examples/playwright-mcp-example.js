/**
 * Example script demonstrating how to use Playwright to connect to
 * MQTT Explorer running with MCP introspection enabled.
 * 
 * Prerequisites:
 * 1. Start MQTT Explorer with MCP introspection:
 *    yarn start:mcp
 * 
 * 2. Run this script:
 *    node examples/playwright-mcp-example.js
 */

const { chromium } = require('playwright')

async function main() {
  console.log('Connecting to MQTT Explorer via Chrome DevTools Protocol...')
  
  try {
    // Connect to the running Electron app via CDP
    const browser = await chromium.connectOverCDP('http://localhost:9222')
    console.log('Connected successfully!')
    
    // Get the existing browser context
    const contexts = browser.contexts()
    if (contexts.length === 0) {
      console.error('No browser contexts found')
      await browser.close()
      return
    }
    
    const context = contexts[0]
    const pages = context.pages()
    
    if (pages.length === 0) {
      console.error('No pages found')
      await browser.close()
      return
    }
    
    const page = pages[0]
    console.log(`Page title: ${await page.title()}`)
    
    // Take a screenshot
    await page.screenshot({ path: 'mqtt-explorer-mcp-screenshot.png' })
    console.log('Screenshot saved to mqtt-explorer-mcp-screenshot.png')
    
    // Example: Check if the connection form is visible
    const usernameInput = await page.locator('//label[contains(text(), "Username")]/..//input')
    const isVisible = await usernameInput.isVisible().catch(() => false)
    console.log(`Username input visible: ${isVisible}`)
    
    // You can add more interactions here
    // For example:
    // - Fill in connection details
    // - Click connect button
    // - Verify UI elements
    // - Test specific features
    
    console.log('Done! Browser connection will remain open.')
    console.log('Press Ctrl+C to close this script (the app will keep running)')
    
    // Keep the script running to maintain the connection
    await new Promise(() => {})
  } catch (error) {
    console.error('Error connecting to MQTT Explorer:', error.message)
    console.error('\nMake sure MQTT Explorer is running with MCP introspection:')
    console.error('  yarn start:mcp')
    process.exit(1)
  }
}

main()
