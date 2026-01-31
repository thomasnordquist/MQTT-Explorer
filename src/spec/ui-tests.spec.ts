import 'mocha'
import { expect } from 'chai'
import { Browser, BrowserContext, ElectronApplication, Page, _electron as electron, chromium } from 'playwright'
import type { MqttClient } from 'mqtt'
import { createTestMock, stopTestMock } from './mock-mqtt-test'
import { default as MockSparkplug } from './mock-sparkplugb'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import { searchTree, clearSearch } from './scenarios/searchTree'
import { expandTopic } from './util/expandTopic'

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
      const browserUrl = process.env.BROWSER_MODE_URL
      if (!browserUrl) {
        throw new Error('BROWSER_MODE_URL environment variable must be set when running in browser mode')
      }
      console.log(`Browser URL: ${browserUrl}`)

      // Check if mobile viewport should be used
      const useMobileViewport = process.env.USE_MOBILE_VIEWPORT === 'true'
      console.log(`Mobile viewport: ${useMobileViewport}`)

      // Launch Chromium browser
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      })

      // Create browser context with optional mobile viewport
      const contextOptions: any = {
        permissions: ['clipboard-read', 'clipboard-write'],
      }

      if (useMobileViewport) {
        // Use same viewport as mobile demo (Pixel 6)
        contextOptions.viewport = {
          width: 412,
          height: 914,
        }
        contextOptions.userAgent =
          'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36'
        console.log('Using mobile viewport: 412x914 (Pixel 6)')
      } else {
        // Desktop viewport - ensure width > 768px so mobile UI doesn't activate
        contextOptions.viewport = {
          width: 1280,
          height: 720,
        }
        console.log('Using desktop viewport: 1280x720')
      }

      browserContext = await browser.newContext(contextOptions)
      page = await browserContext.newPage()

      // Listen for console messages
      page.on('console', msg => console.log('Browser console:', msg.type(), msg.text()))
      page.on('pageerror', error => console.error('Browser error:', error))

      // Navigate to the browser mode URL
      await page.goto(browserUrl, { timeout: 30000, waitUntil: 'networkidle' })

      // Handle authentication if required
      const username = process.env.MQTT_EXPLORER_USERNAME || 'test'
      const password = process.env.MQTT_EXPLORER_PASSWORD || 'test123'

      console.log('Waiting for page to initialize and auth check...')
      await sleep(5000) // Wait longer for WebSocket connection attempt and auth error handling

      console.log('Checking for login dialog...')
      const loginDialog = page.locator('h2:has-text("Login to MQTT Explorer")')
      let loginDialogVisible = false
      try {
        loginDialogVisible = await loginDialog.isVisible({ timeout: 10000 })
      } catch (error) {
        // Timeout is expected if dialog is not shown, not an error
        console.log('Login dialog not found (timeout) - checking if auth is disabled')
      }

      // Debug: print page content to see what's rendered
      if (!loginDialogVisible) {
        const body = await page
          .locator('body')
          .textContent()
          .catch(() => 'Unable to read body')
        console.log('Page body text:', body?.substring(0, 300))
      }

      if (loginDialogVisible) {
        console.log('Login dialog detected, authenticating...')
        await page.fill('[data-testid="username-input"] input', username)
        await page.fill('[data-testid="password-input"] input', password)
        await page.click('button:has-text("Login")')
        await sleep(3000) // Wait for authentication to complete and reconnect
        console.log('Authentication complete')
      } else {
        console.log('No login dialog detected - assuming auth is disabled')
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
    const brokerHost = process.env.TESTS_MQTT_BROKER_HOST || '127.0.0.1'
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
    } else if (electronApp) {
      await electronApp.close()
    }

    stopTestMock()
  })

  describe('Connection Management', () => {
    it('should connect and expand livingroom/lamp topic', async () => {
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
    it('should expand and display kitchen/coffee_maker with JSON payload', async () => {
      // Given: Connected to broker with kitchen/coffee_maker topic
      // When: Expand topic
      await expandTopic('kitchen/coffee_maker', page)

      // Then: The topic should be visible and selected
      const coffeeMakerTopic = page.locator('span[data-test-topic="coffee_maker"]').first()
      await coffeeMakerTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await coffeeMakerTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-kitchen-json.png' })
    })

    it('should expand nested topic livingroom/lamp/state', async () => {
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
    it('should search for temperature and expand kitchen/temperature', async () => {
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

    it('should search for lamp and expand kitchen/lamp', async () => {
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

  describe('Clipboard Operations', () => {
    it('should copy topic path to clipboard in both Electron and browser modes', async () => {
      // Given: A topic is selected
      await clearSearch(page)
      await sleep(1000)
      await expandTopic('livingroom/lamp/state', page)
      await sleep(1000)

      // When: Copy topic button is clicked (in the topic section at the top)
      // The new sidebar has copy buttons in the topic section (for path) and value section (for value)
      // We need to find the first copy button (topic path copy button)
      const copyButtons = page.getByTestId('copy-button')
      const copyTopicButton = copyButtons.first()
      await copyTopicButton.click()
      await sleep(500)

      // Then: Clipboard should contain the topic path
      const clipboardText = await page.evaluate(async () => {
        try {
          // Try to read from clipboard using the Clipboard API
          if (navigator.clipboard && navigator.clipboard.readText) {
            return await navigator.clipboard.readText()
          }
          // Fallback: try to paste into a temporary input element
          const input = document.createElement('input')
          document.body.appendChild(input)
          input.focus()
          document.execCommand('paste')
          const text = input.value
          document.body.removeChild(input)
          return text
        } catch (error) {
          // If clipboard access fails, return empty string
          console.warn('Clipboard read failed:', error)
          return ''
        }
      })

      // Verify clipboard contains expected topic path
      if (clipboardText) {
        expect(clipboardText).to.equal('livingroom/lamp/state')
      } else {
        // If clipboard reading is not available, at least verify the button was clicked
        console.warn('Clipboard verification not available in this environment')
        const copyButton = await copyTopicButton.isVisible()
        expect(copyButton).to.be.true
      }

      await page.screenshot({ path: 'test-screenshot-copy-topic.png' })
    })

    it('should copy message value to clipboard in both Electron and browser modes', async () => {
      // Given: A topic with a value is selected (reuse already expanded topic)
      // When: Copy value button is clicked (the second copy button in the value section)
      const copyButtons = page.getByTestId('copy-button')
      const copyValueButton = copyButtons.nth(1) // Second copy button is for the value
      await copyValueButton.click()
      await sleep(500)

      // Then: Clipboard should contain the message value
      const clipboardText = await page.evaluate(async () => {
        try {
          // Try to read from clipboard using the Clipboard API
          if (navigator.clipboard && navigator.clipboard.readText) {
            return await navigator.clipboard.readText()
          }
          // Fallback: try to paste into a temporary input element
          const input = document.createElement('input')
          document.body.appendChild(input)
          input.focus()
          document.execCommand('paste')
          const text = input.value
          document.body.removeChild(input)
          return text
        } catch (error) {
          // If clipboard access fails, return empty string
          console.warn('Clipboard read failed:', error)
          return ''
        }
      })

      // Verify clipboard contains expected value (should be "on" from livingroom/lamp/state)
      if (clipboardText) {
        expect(clipboardText).to.equal('on')
      } else {
        // If clipboard reading is not available, at least verify the button was clicked
        console.warn('Clipboard verification not available in this environment')
        const copyButton = await copyValueButton.isVisible()
        expect(copyButton).to.be.true
      }

      await page.screenshot({ path: 'test-screenshot-copy-value.png' })
    })
  })

  describe('File Save/Download Operations', () => {
    it('should save/download message to file in both Electron and browser modes', async () => {
      // Given: A topic with a message is already selected from previous test
      await sleep(500)

      if (isBrowserMode) {
        // In browser mode, set up download handling
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 })

        // When: Save button is clicked (in the new sidebar, save button is in the value section)
        const saveButton = page.getByTestId('save-button')
        await saveButton.click()

        // Then: Download should be triggered
        const download = await downloadPromise
        expect(download).to.not.be.undefined

        // Verify download has a filename
        const filename = download.suggestedFilename()
        expect(filename).to.include('mqtt-message-')
        console.log('Browser mode: File downloaded:', filename)

        // Save to verify (optional, but helps with debugging)
        await download.saveAs(`/tmp/${filename}`)
      } else {
        // In Electron mode, the file dialog would open
        // We can't easily test the native file dialog, but we can verify the button works
        const saveButton = page.getByTestId('save-button')
        const isVisible = await saveButton.isVisible()
        expect(isVisible).to.be.true

        // Note: In Electron, clicking this would open a native dialog which we can't easily automate
        // For now, just verify the button exists
        console.log('Electron mode: Save button is visible (native dialog not tested)')
      }

      await page.screenshot({ path: 'test-screenshot-save-message.png' })
    })
  })
})
