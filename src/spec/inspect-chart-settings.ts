import { chromium, Page } from 'playwright'

async function inspect() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  console.log('Navigating to localhost:3000...')
  await page.goto('http://localhost:3000')
  await page.waitForTimeout(2000)

  // Login
  console.log('Logging in...')
  await page.fill('[name="username"]', 'test')
  await page.fill('[name="password"]', 'test123')
  await page.locator('[type="submit"]').click()
  await page.waitForTimeout(3000)

  // Expand kitchen/coffee_maker topic
  console.log('Expanding kitchen topic...')
  const kitchenTopic = page.locator('[data-test-topic="kitchen"]').first()
  await kitchenTopic.click()
  await page.waitForTimeout(500)

  console.log('Clicking coffee_maker topic...')
  const coffeeMakerTopic = page.locator('[data-test-topic="kitchen/coffee_maker"]').first()
  await coffeeMakerTopic.click()
  await page.waitForTimeout(1500)

  // Look for ShowChart icons
  console.log('\n=== ShowChart Elements ===')
  const showCharts = await page.locator('//*[contains(@data-test-type, "ShowChart")]').all()
  console.log(`Found ${showCharts.length} ShowChart elements:`)
  for (let i = 0; i < showCharts.length; i++) {
    const dataTest = await showCharts[i].getAttribute('data-test')
    const isVisible = await showCharts[i].isVisible()
    console.log(`  [${i}] data-test="${dataTest}", visible=${isVisible}`)
  }

  // Click heater ShowChart icon
  console.log('\n=== Clicking heater ShowChart ===')
  const heaterChart = page
    .locator('//*[contains(@data-test-type, "ShowChart")][contains(@data-test, "heater")]')
    .first()
  await heaterChart.waitFor({ state: 'visible', timeout: 5000 })
  await heaterChart.click()
  await page.waitForTimeout(2000)

  // Check for ChartPanel
  console.log('\n=== Looking for ChartPanel ===')
  const chartPanels = await page.locator('[data-test-type="ChartPaper"]').all()
  console.log(`Found ${chartPanels.length} ChartPanel elements`)
  for (let i = 0; i < chartPanels.length; i++) {
    const dataTest = await chartPanels[i].getAttribute('data-test')
    console.log(`  [${i}] data-test="${dataTest}"`)
  }

  // Look for ChartSettings buttons
  console.log('\n=== Looking for ChartSettings Elements ===')
  const allSettings = await page.locator('//*[@data-test-type="ChartSettings"]').all()
  console.log(`Found ${allSettings.length} ChartSettings elements (using @data-test-type):`)
  for (let i = 0; i < allSettings.length; i++) {
    const dataTest = await allSettings[i].getAttribute('data-test')
    const isVisible = await allSettings[i].isVisible()
    const box = await allSettings[i].boundingBox()
    console.log(`  [${i}] data-test="${dataTest}", visible=${isVisible}, box=${JSON.stringify(box)}`)
  }

  // Try different locator strategies
  console.log('\n=== Trying contains query for ChartSettings with "heater" ===')
  const heaterSettings = page.locator('//*[contains(@data-test-type, "ChartSettings")][contains(@data-test, "heater")]')
  const count = await heaterSettings.count()
  console.log(`Found ${count} elements`)
  if (count > 0) {
    const dataTest = await heaterSettings.first().getAttribute('data-test')
    const isVisible = await heaterSettings.first().isVisible()
    console.log(`  data-test="${dataTest}", visible=${isVisible}`)
  }

  // Take screenshot
  await page.screenshot({ path: '/tmp/chart-settings-inspection.png', fullPage: true })
  console.log('\nScreenshot saved to /tmp/chart-settings-inspection.png')

  await browser.close()
}

inspect().catch(console.error)
