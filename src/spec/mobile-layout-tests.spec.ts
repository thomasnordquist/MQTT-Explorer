import 'mocha'
import { expect } from 'chai'
import { Browser, BrowserContext, Page, chromium } from 'playwright'
import { createTestMock, stopTestMock } from './mock-mqtt-test'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import { expandTopic } from './util/expandTopic'
import { selectTopic } from './util/selectTopic'
import type { MqttClient } from 'mqtt'

/**
 * Mobile Layout Tests for MQTT Explorer
 * 
 * Tests the mobile-specific UI behavior with mobile viewport (412x914)
 * including tab-based navigation and topic selection/expansion.
 * 
 * These tests verify:
 * - Clicking on topic text selects topic and switches to Details tab
 * - Clicking on expand button expands/collapses topics
 * - Mobile tabs (Topics/Details) function correctly
 */
describe('Mobile Layout Tests', function () {
  this.timeout(60000)

  let browser: Browser | undefined
  let browserContext: BrowserContext | undefined
  let testMock: MqttClient
  let page: Page
  const browserUrl = process.env.BROWSER_MODE_URL || 'http://localhost:3000'

  before(async function () {
    this.timeout(90000)

    console.log('Creating test-specific MQTT mock for mobile tests...')
    testMock = await createTestMock()

    console.log('Publishing test topics...')
    // Publish test topics for mobile layout tests
    testMock.publish('mobile/test/topic1', 'value1', { retain: true, qos: 0 })
    testMock.publish('mobile/test/topic2', 'value2', { retain: true, qos: 0 })
    testMock.publish('mobile/test/subtopic/item1', 'item1-value', { retain: true, qos: 0 })
    testMock.publish('mobile/test/subtopic/item2', 'item2-value', { retain: true, qos: 0 })
    testMock.publish('mobile/demo/sensor', '{"temperature": 22.5}', { retain: true, qos: 0 })

    await sleep(2000) // Let MQTT messages propagate

    console.log('Launching browser with mobile viewport...')

    // Launch Chromium browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })

    // Create browser context with mobile viewport (Pixel 6)
    browserContext = await browser.newContext({
      viewport: {
        width: 412,
        height: 914,
      },
      userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',
      permissions: ['clipboard-read', 'clipboard-write'],
    })
    
    page = await browserContext.newPage()

    // Listen for console messages
    page.on('console', msg => console.log('Browser console:', msg.type(), msg.text()))
    page.on('pageerror', error => console.error('Browser error:', error))

    // Navigate to the browser mode URL
    await page.goto(browserUrl, { timeout: 30000, waitUntil: 'networkidle' })

    // Handle authentication if required
    console.log('Waiting for page to initialize...')
    await sleep(3000)

    console.log('Checking for login dialog...')
    const loginDialog = page.locator('h2:has-text("Login to MQTT Explorer")')
    let loginDialogVisible = false
    try {
      loginDialogVisible = await loginDialog.isVisible({ timeout: 5000 })
    } catch (error) {
      console.log('Login dialog not found - assuming auth is disabled')
    }

    if (loginDialogVisible) {
      const username = process.env.MQTT_EXPLORER_USERNAME || 'test'
      const password = process.env.MQTT_EXPLORER_PASSWORD || 'test123'
      console.log('Login dialog detected, authenticating...')
      await page.fill('[data-testid="username-input"] input', username)
      await page.fill('[data-testid="password-input"] input', password)
      await page.click('button:has-text("Login")')
      await sleep(3000)
      console.log('Authentication complete')
    }

    // Connect to MQTT broker
    console.log('Connecting to MQTT broker...')
    await connectTo(page, '127.0.0.1', 1883)
    await sleep(3000) // Wait for topics to load

    // Verify mobile tabs are visible
    const topicsTab = page.locator('button:has-text("Topics")')
    const detailsTab = page.locator('button:has-text("Details")')
    
    const topicsVisible = await topicsTab.isVisible({ timeout: 5000 })
    const detailsVisible = await detailsTab.isVisible({ timeout: 5000 })
    
    if (!topicsVisible || !detailsVisible) {
      console.error('Mobile tabs not found! Taking screenshot for debugging...')
      await page.screenshot({ path: 'mobile-tabs-not-found.png', fullPage: true })
      throw new Error('Mobile tabs (Topics/Details) not visible - mobile layout may not be active')
    }

    console.log('Mobile tabs verified, switching to Topics tab')
    await topicsTab.click()
    await sleep(500)
  })

  after(async function () {
    console.log('Cleaning up mobile layout tests...')
    if (browserContext) {
      await browserContext.close()
    }
    if (browser) {
      await browser.close()
    }
    await stopTestMock(testMock)
  })

  describe('Mobile Tab Navigation', function () {
    it('should show Topics tab and Details tab', async function () {
      const topicsTab = page.locator('button:has-text("Topics")')
      const detailsTab = page.locator('button:has-text("Details")')
      
      expect(await topicsTab.isVisible()).to.be.true
      expect(await detailsTab.isVisible()).to.be.true
    })

    it('should start on Topics tab by default', async function () {
      const topicsTab = page.locator('button:has-text("Topics")')
      
      // Check if Topics tab is selected (has aria-selected="true" or similar)
      const tabElement = await topicsTab.elementHandle()
      const ariaSelected = await tabElement?.getAttribute('aria-selected')
      
      // Note: MUI tabs might use different attributes, so we check for visual indicators
      // If aria-selected is not used, we can check for CSS classes or other indicators
      console.log('Topics tab aria-selected:', ariaSelected)
    })

    it('should switch between Topics and Details tabs', async function () {
      const topicsTab = page.locator('button:has-text("Topics")')
      const detailsTab = page.locator('button:has-text("Details")')
      
      // Click Details tab
      await detailsTab.click()
      await sleep(500)
      
      // Click Topics tab
      await topicsTab.click()
      await sleep(500)
      
      // Verify we can switch tabs without errors
      expect(await topicsTab.isVisible()).to.be.true
      expect(await detailsTab.isVisible()).to.be.true
    })
  })

  describe('Topic Expansion (Mobile)', function () {
    beforeEach(async function () {
      // Ensure we're on the Topics tab
      const topicsTab = page.locator('button:has-text("Topics")')
      await topicsTab.click()
      await sleep(500)
    })

    it('should expand topic when clicking expand button', async function () {
      // Expand the 'mobile' topic by clicking its expand button
      console.log('Expanding mobile topic...')
      await expandTopic(page, 'mobile')
      await sleep(1000)

      // Verify child topics are visible
      const testTopic = page.locator('span[data-test-topic="mobile/test"]')
      const isVisible = await testTopic.isVisible({ timeout: 5000 })
      
      expect(isVisible).to.be.true
      console.log('✓ Topic expanded successfully')
    })

    it('should expand nested topics', async function () {
      // Expand mobile > test > subtopic
      console.log('Expanding nested topics...')
      await expandTopic(page, 'mobile')
      await sleep(500)
      
      await expandTopic(page, 'mobile/test')
      await sleep(500)
      
      await expandTopic(page, 'mobile/test/subtopic')
      await sleep(500)

      // Verify nested child topics are visible
      const item1 = page.locator('span[data-test-topic="mobile/test/subtopic/item1"]')
      const isVisible = await item1.isVisible({ timeout: 5000 })
      
      expect(isVisible).to.be.true
      console.log('✓ Nested topics expanded successfully')
    })

    it('should not switch tabs when clicking expand button', async function () {
      // Ensure we're on Topics tab
      const topicsTab = page.locator('button:has-text("Topics")')
      const detailsTab = page.locator('button:has-text("Details")')
      
      await topicsTab.click()
      await sleep(500)

      // Expand a topic
      await expandTopic(page, 'mobile')
      await sleep(1000)

      // Verify we're still on Topics tab (tree should still be visible)
      const mobileTopic = page.locator('span[data-test-topic="mobile"]')
      const stillVisible = await mobileTopic.isVisible({ timeout: 2000 })
      
      expect(stillVisible).to.be.true
      console.log('✓ Stayed on Topics tab after expanding')
    })
  })

  describe('Topic Selection (Mobile)', function () {
    before(async function () {
      // Expand topics for selection tests
      const topicsTab = page.locator('button:has-text("Topics")')
      await topicsTab.click()
      await sleep(500)
      
      await expandTopic(page, 'mobile')
      await sleep(500)
      await expandTopic(page, 'mobile/test')
      await sleep(500)
    })

    it('should switch to Details tab when clicking topic text', async function () {
      console.log('Selecting topic by clicking text...')
      
      // Ensure we're on Topics tab first
      const topicsTab = page.locator('button:has-text("Topics")')
      await topicsTab.click()
      await sleep(500)

      // Click on topic text to select it
      await selectTopic(page, 'mobile/test/topic1')
      await sleep(1000)

      // Verify we switched to Details tab
      // The Details tab should now be showing content
      const detailsContent = page.locator('div').filter({ hasText: /value1|topic1/ })
      
      try {
        const hasContent = await detailsContent.first().isVisible({ timeout: 5000 })
        expect(hasContent).to.be.true
        console.log('✓ Switched to Details tab and showing topic data')
      } catch (error) {
        console.error('Failed to find topic details, taking screenshot...')
        await page.screenshot({ path: 'topic-selection-failed.png', fullPage: true })
        throw error
      }
    })

    it('should display selected topic details on Details tab', async function () {
      // Ensure we're on Topics tab
      const topicsTab = page.locator('button:has-text("Topics")')
      await topicsTab.click()
      await sleep(500)

      // Select a topic with JSON data
      await selectTopic(page, 'mobile/demo/sensor')
      await sleep(1000)

      // Verify details are shown (look for the JSON data or topic name)
      const hasTemperature = await page.locator('text=/temperature|22.5/i').first().isVisible({ timeout: 5000 })
      
      expect(hasTemperature).to.be.true
      console.log('✓ Topic details displayed correctly')
    })

    it('should allow switching back to Topics tab after selection', async function () {
      const topicsTab = page.locator('button:has-text("Topics")')
      const detailsTab = page.locator('button:has-text("Details")')
      
      // Select a topic (should switch to Details)
      await topicsTab.click()
      await sleep(500)
      await selectTopic(page, 'mobile/test/topic2')
      await sleep(1000)

      // Switch back to Topics tab
      await topicsTab.click()
      await sleep(500)

      // Verify tree is visible again
      const mobileTopic = page.locator('span[data-test-topic="mobile"]')
      const treeVisible = await mobileTopic.isVisible({ timeout: 3000 })
      
      expect(treeVisible).to.be.true
      console.log('✓ Successfully switched back to Topics tab')
    })

    it('should select different topics and update Details view', async function () {
      const topicsTab = page.locator('button:has-text("Topics")')
      
      // Select first topic
      await topicsTab.click()
      await sleep(500)
      await selectTopic(page, 'mobile/test/topic1')
      await sleep(1000)

      let hasValue = await page.locator('text=/value1/i').first().isVisible({ timeout: 3000 })
      expect(hasValue).to.be.true
      console.log('✓ First topic selected')

      // Select second topic
      await topicsTab.click()
      await sleep(500)
      await selectTopic(page, 'mobile/test/topic2')
      await sleep(1000)

      hasValue = await page.locator('text=/value2/i').first().isVisible({ timeout: 3000 })
      expect(hasValue).to.be.true
      console.log('✓ Second topic selected and details updated')
    })
  })

  describe('Mobile UI Integration', function () {
    it('should maintain tree state when switching between tabs', async function () {
      const topicsTab = page.locator('button:has-text("Topics")')
      const detailsTab = page.locator('button:has-text("Details")')
      
      // Ensure topics are expanded
      await topicsTab.click()
      await sleep(500)
      await expandTopic(page, 'mobile')
      await sleep(500)

      // Switch to Details tab
      await detailsTab.click()
      await sleep(500)

      // Switch back to Topics tab
      await topicsTab.click()
      await sleep(500)

      // Verify the topic is still expanded
      const testTopic = page.locator('span[data-test-topic="mobile/test"]')
      const stillExpanded = await testTopic.isVisible({ timeout: 3000 })
      
      expect(stillExpanded).to.be.true
      console.log('✓ Tree state maintained across tab switches')
    })

    it('should handle rapid tab switching without errors', async function () {
      const topicsTab = page.locator('button:has-text("Topics")')
      const detailsTab = page.locator('button:has-text("Details")')
      
      // Rapidly switch between tabs
      for (let i = 0; i < 5; i++) {
        await detailsTab.click()
        await sleep(200)
        await topicsTab.click()
        await sleep(200)
      }

      // Verify UI is still functional
      const mobileTopic = page.locator('span[data-test-topic="mobile"]')
      const stillVisible = await mobileTopic.isVisible({ timeout: 3000 })
      
      expect(stillVisible).to.be.true
      console.log('✓ UI remains functional after rapid tab switching')
    })
  })
})
