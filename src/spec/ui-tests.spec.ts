import 'mocha'
import { expect } from 'chai'
import { Browser, BrowserContext, ElectronApplication, Page, _electron as electron, chromium } from 'playwright'
import { createTestMock, stopTestMock } from './mock-mqtt-test'
import { default as MockSparkplug } from './mock-sparkplugb'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import { searchTree, clearSearch } from './scenarios/searchTree'
import { expandTopic } from './util/expandTopic'
import type { MqttClient } from 'mqtt'

/**
 * MQTT Explorer UI Tests
 *
 * Tests the core UI functionality using a single connection.
 * All topics are published before connecting, and tests run sequentially
 * on the same connected application instance.
 * 
 * Supports both Electron and Browser modes:
 * - Electron mode: Default behavior, launches Electron app
 * - Browser mode: Set BROWSER_MODE_URL environment variable to the server URL
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
describe('MQTT Explorer UI Tests', function () {
  this.timeout(60000)

  let electronApp: ElectronApplication | undefined
  let browser: Browser | undefined
  let browserContext: BrowserContext | undefined
  let testMock: MqttClient
  let page: Page
  const isBrowserMode = !!process.env.BROWSER_MODE_URL

  before(async function () {
    this.timeout(90000)

    console.log('Creating test-specific MQTT mock (no timers)...')
    testMock = await createTestMock()

    console.log('Publishing test topics...')
    // Publish all test topics before connecting
    testMock.publish('livingroom/lamp/state', 'on', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp/brightness', '128', { retain: true, qos: 0 })
    testMock.publish('livingroom/temperature', '21.0', { retain: true, qos: 0 })

    const coffeeData = {
      heater: 'on',
      temperature: 92.5,
      waterLevel: 0.5,
    }
    testMock.publish('kitchen/coffee_maker', JSON.stringify(coffeeData), { retain: true, qos: 2 })
    testMock.publish('kitchen/lamp/state', 'off', { retain: true, qos: 0 })
    testMock.publish('kitchen/temperature', '22.5', { retain: true, qos: 0 })

    await sleep(2000) // Let MQTT messages propagate and get retained

    if (isBrowserMode) {
      console.log('Launching browser in browser mode...')
      const browserUrl = process.env.BROWSER_MODE_URL!
      console.log(`Browser URL: ${browserUrl}`)

      // Launch Chromium browser
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      })

      browserContext = await browser.newContext()
      page = await browserContext.newPage()

      // Listen for console messages
      page.on('console', msg => console.log('Browser console:', msg.type(), msg.text()))
      page.on('pageerror', error => console.error('Browser error:', error))

      // Navigate to the browser mode URL
      await page.goto(browserUrl, { timeout: 30000, waitUntil: 'networkidle' })

      // Handle authentication if required
      const username = process.env.MQTT_EXPLORER_USERNAME || 'test'
      const password = process.env.MQTT_EXPLORER_PASSWORD || 'test123'

      console.log('Waiting for page to initialize...')
      await sleep(3000) // Wait for WebSocket connection and auth check

      console.log('Checking for login dialog...')
      const loginDialog = page.locator('h2:has-text("Login to MQTT Explorer")')
      const loginDialogVisible = await loginDialog.isVisible({ timeout: 5000 }).catch(() => false)

      if (loginDialogVisible) {
        console.log('Login dialog detected, authenticating...')
        await page.fill('[data-testid="username-input"]', username)
        await page.fill('[data-testid="password-input"]', password)
        await page.click('button:has-text("Login")')
        await sleep(2000) // Wait for authentication to complete
        console.log('Authentication complete')
      } else {
        console.log('No login dialog detected')
      }

      // Wait for the connection dialog to appear
      console.log('Waiting for MQTT connection dialog...')
      try {
        await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })
      } catch (error) {
        console.log('Failed to find connection dialog, taking screenshot for debugging')
        await page.screenshot({ path: 'browser-debug-screenshot.png', fullPage: true })
        throw error
      }
    } else {
      console.log('Launching Electron application...')
      electronApp = await electron.launch({
        args: [`${__dirname}/../../..`, '--runningUiTestOnCi', '--no-sandbox', '--disable-dev-shm-usage'],
        timeout: 60000,
      })

      console.log('Getting application window...')
      page = await electronApp.firstWindow({ timeout: 30000 })
      await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })
    }

    console.log('Connecting to MQTT broker...')
    const brokerHost = process.env.MQTT_BROKER_HOST || '127.0.0.1'
    await connectTo(brokerHost, page)
    await sleep(3000) // Give time for topics to load
    console.log('Setup complete')
  })

  after(async function () {
    this.timeout(10000)

    if (isBrowserMode) {
      if (browserContext) {
        await browserContext.close()
      }
      if (browser) {
        await browser.close()
      }
    } else {
      if (electronApp) {
        await electronApp.close()
      }
    }

    stopTestMock()
  })

  describe('Connection Management', () => {
    it('should connect and expand livingroom/lamp topic', async function () {
      // Given: Connected to broker with topics loaded
      // When: Expand topic
      await expandTopic('livingroom/lamp', page)

      // Then: Should see lamp state topic
      const stateTopic = page.locator('span[data-test-topic="state"]').first()
      await stateTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await stateTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-connection.png' })
    })
  })

  describe('Topic Tree Structure', () => {
    it('should expand and display kitchen/coffee_maker with JSON payload', async function () {
      // Given: Connected to broker with kitchen/coffee_maker topic
      // When: Expand topic
      await expandTopic('kitchen/coffee_maker', page)

      // Then: The topic should be visible and selected
      const coffeeMakerTopic = page.locator('span[data-test-topic="coffee_maker"]').first()
      await coffeeMakerTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await coffeeMakerTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-kitchen-json.png' })
    })

    it('should expand nested topic livingroom/lamp/state', async function () {
      // Given: Connected to broker with nested topics
      // When: Expand to nested topic
      await expandTopic('livingroom/lamp/state', page)

      // Then: State topic should be visible and selected
      const stateTopic = page.locator('span[data-test-topic="state"]').first()
      await stateTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await stateTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-nested-topic.png' })
    })
  })

  describe('Search Functionality', () => {
    it('should search for temperature and expand kitchen/temperature', async function () {
      // Given: Connected to broker with temperature topics
      // When: Search and expand
      await searchTree('temp', page)
      await sleep(1000)
      await clearSearch(page)
      await sleep(500)
      await expandTopic('kitchen/temperature', page)

      // Then: Temperature topic should be visible
      const tempTopic = page.locator('span[data-test-topic="temperature"]').first()
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search-temp.png' })
    })

    it('should search for lamp and expand kitchen/lamp', async function () {
      // Given: Connected to broker with lamp topics
      // When: Search and expand
      await searchTree('kitchen/lamp', page)
      await sleep(1000)
      await clearSearch(page)
      await sleep(500)
      await expandTopic('kitchen/lamp', page)

      // Then: Lamp topic should be visible
      const lampTopic = page.locator('span[data-test-topic="lamp"]').first()
      await lampTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await lampTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search-lamp.png' })
    })
  })
})
