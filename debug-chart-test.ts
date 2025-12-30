import { _electron as electron, Page } from 'playwright'
import { expandTopic, sleep } from './src/spec/util'

async function debugChartTest() {
  const app = await electron.launch({
    args: ['dist/src/electron.js'],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: '1',
      ELECTRON_NO_ATTACH_CONSOLE: '1',
    },
  })
  
  const browser: Page = await app.firstWindow()
  
  // Wait for app to load
  await sleep(5000)
  
  // Expand topic
  console.log('Expanding kitchen/coffee_maker...')
  await expandTopic('kitchen/coffee_maker', browser)
  await sleep(2000)
  
  // Find ShowChart for heater
  console.log('Looking for ShowChart[heater]...')
  const showChartLocator = browser
    .locator(`//*[contains(@data-test-type, "ShowChart")][contains(@data-test, "heater")]`)
    .first()
  
  await showChartLocator.waitFor({ state: 'visible', timeout: 30000 })
  console.log('Found ShowChart[heater]')
  
  // Take screenshot before click
  await browser.screenshot({ path: '/tmp/before-click.png' })
  console.log('Screenshot saved: /tmp/before-click.png')
  
  // Click it
  console.log('Clicking ShowChart[heater]...')
  await showChartLocator.click({ force: true })
  await sleep(2000)
  
  // Take screenshot after click
  await browser.screenshot({ path: '/tmp/after-click.png' })
  console.log('Screenshot saved: /tmp/after-click.png')
  
  // Look for chart panel
  console.log('Looking for chart panel...')
  const chartPanelCount = await browser.locator('[data-test-type="ChartPaper"]').count()
  console.log(`Found ${chartPanelCount} chart panels`)
  
  // Look for ChartSettings
  console.log('Looking for ChartSettings[heater]...')
  const settingsLocator = browser.locator(
    `//*[contains(@data-test-type, "ChartSettings")][contains(@data-test, "heater")]`
  )
  const settingsCount = await settingsLocator.count()
  console.log(`Found ${settingsCount} ChartSettings buttons`)
  
  if (settingsCount > 0) {
    const isVisible = await settingsLocator.first().isVisible()
    console.log(`ChartSettings[heater] visible: ${isVisible}`)
    
    const dataTest = await settingsLocator.first().getAttribute('data-test')
    console.log(`ChartSettings data-test value: "${dataTest}"`)
  }
  
  // Dump all elements with data-test-type
  console.log('\nAll elements with data-test-type:')
  const allTestElements = await browser.locator('[data-test-type]').all()
  for (const el of allTestElements) {
    const type = await el.getAttribute('data-test-type')
    const test = await el.getAttribute('data-test')
    const visible = await el.isVisible()
    console.log(`  ${type} [${test}] - visible: ${visible}`)
  }
  
  await sleep(5000)
  await app.close()
}

debugChartTest().catch(console.error)
