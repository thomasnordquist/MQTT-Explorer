import 'mocha'
import { expect } from 'chai'
import { Browser, BrowserContext, Page, chromium } from 'playwright'
import { createTestMock, stopTestMock } from './mock-mqtt-test'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import type { MqttClient } from 'mqtt'

/**
 * Viewport Switching Test
 *
 * This test checks for React errors when switching between mobile and desktop viewports.
 * The breakpoint is at 768px width.
 */
describe('Viewport Switching Tests', function () {
  this.timeout(120000)

  let browser: Browser | undefined
  let browserContext: BrowserContext | undefined
  let testMock: MqttClient
  let page: Page

  before(async function () {
    this.timeout(90000)

    console.log('Creating test-specific MQTT mock...')
    testMock = await createTestMock()

    console.log('Publishing test topics...')
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

    await sleep(2000) // Let MQTT messages propagate

    console.log('Launching browser...')
    const browserUrl = process.env.BROWSER_MODE_URL || 'http://localhost:3000'
    console.log(`Browser URL: ${browserUrl}`)

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    })

    // Start with mobile viewport (below 768px)
    browserContext = await browser.newContext({
      viewport: {
        width: 412,
        height: 914,
      },
      permissions: ['clipboard-read', 'clipboard-write'],
    })
    page = await browserContext.newPage()

    // Collect console messages and errors
    const consoleMessages: string[] = []
    const pageErrors: Error[] = []

    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(`[${msg.type()}] ${text}`)
      console.log('Browser console:', msg.type(), text)
    })
    
    page.on('pageerror', error => {
      pageErrors.push(error)
      console.error('Browser error:', error.message)
    })

    // Store these in page context for access in tests
    ;(page as any).testConsoleMessages = consoleMessages
    ;(page as any).testPageErrors = pageErrors

    // Navigate to the browser mode URL
    await page.goto(browserUrl, { timeout: 30000, waitUntil: 'networkidle' })

    // Handle authentication if required
    const username = process.env.MQTT_EXPLORER_USERNAME || 'test'
    const password = process.env.MQTT_EXPLORER_PASSWORD || 'test123'

    console.log('Waiting for page to initialize...')
    await sleep(5000)

    const loginDialog = page.locator('h2:has-text("Login to MQTT Explorer")')
    let loginDialogVisible = false
    try {
      loginDialogVisible = await loginDialog.isVisible({ timeout: 10000 })
    } catch (error) {
      console.log('Login dialog not found - assuming auth is disabled')
    }

    if (loginDialogVisible) {
      console.log('Login dialog detected, authenticating...')
      await page.fill('[data-testid="username-input"] input', username)
      await page.fill('[data-testid="password-input"] input', password)
      await page.click('button:has-text("Login")')
      await sleep(3000)
      console.log('Authentication complete')
    }

    // Wait for the connection dialog to appear
    console.log('Waiting for MQTT connection dialog...')
    await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })

    console.log('Connecting to MQTT broker...')
    const brokerHost = process.env.TESTS_MQTT_BROKER_HOST || '127.0.0.1'
    await connectTo(brokerHost, page)
    await sleep(3000) // Give time for topics to load
    console.log('Setup complete (mobile viewport)')
  })

  after(async function () {
    this.timeout(10000)

    if (browserContext) {
      await browserContext.close()
    }
    if (browser) {
      await browser.close()
    }

    stopTestMock()
  })

  describe('Mobile to Desktop Viewport Switch', () => {
    it('should switch from mobile (412px) to desktop (1280px) without React errors', async function () {
      // Given: Mobile viewport (412x914) with topics loaded
      console.log('Current viewport: 412x914 (mobile)')
      await page.screenshot({ path: 'test-viewport-mobile-before.png', fullPage: true })
      
      // Clear previous errors
      const pageErrors = (page as any).testPageErrors as Error[]
      const consoleMessages = (page as any).testConsoleMessages as string[]
      pageErrors.length = 0
      consoleMessages.length = 0

      // When: Switch to desktop viewport (>768px)
      console.log('Switching viewport to 1280x720 (desktop)...')
      await page.setViewportSize({ width: 1280, height: 720 })
      await sleep(2000) // Wait for resize handlers and re-renders

      console.log('Viewport switched to desktop')
      await page.screenshot({ path: 'test-viewport-desktop-after.png', fullPage: true })

      // Then: No React errors should occur
      console.log(`Console messages: ${consoleMessages.length}`)
      console.log(`Page errors: ${pageErrors.length}`)

      // Filter out common warnings that are not related to the viewport switch
      const relevantErrors = pageErrors.filter(error => {
        const message = error.message || error.toString()
        // Filter out known warnings
        return !message.includes('IpcRendererEventBus') &&
               !message.includes('componentWillReceiveProps') &&
               !message.includes('locale') &&
               !message.includes('ACE editor')
      })

      // Check for React-specific errors in console
      const reactErrors = consoleMessages.filter(msg => 
        msg.toLowerCase().includes('error') &&
        (msg.includes('React') || msg.includes('react') || msg.includes('Warning:'))
      )

      console.log('Relevant page errors:', relevantErrors.length)
      console.log('React console errors:', reactErrors.length)

      if (relevantErrors.length > 0) {
        console.error('Page errors detected:')
        relevantErrors.forEach(err => console.error('  -', err.message))
      }

      if (reactErrors.length > 0) {
        console.error('React errors detected:')
        reactErrors.forEach(msg => console.error('  -', msg))
      }

      expect(relevantErrors.length, 'Should have no relevant page errors').to.equal(0)
      expect(reactErrors.length, 'Should have no React console errors').to.equal(0)
    })

    it('should switch from desktop to mobile without React errors', async function () {
      // Given: Desktop viewport (1280x720) from previous test
      console.log('Current viewport: 1280x720 (desktop)')
      
      // Clear previous errors
      const pageErrors = (page as any).testPageErrors as Error[]
      const consoleMessages = (page as any).testConsoleMessages as string[]
      pageErrors.length = 0
      consoleMessages.length = 0

      // When: Switch back to mobile viewport (<768px)
      console.log('Switching viewport to 412x914 (mobile)...')
      await page.setViewportSize({ width: 412, height: 914 })
      await sleep(2000) // Wait for resize handlers and re-renders

      console.log('Viewport switched to mobile')
      await page.screenshot({ path: 'test-viewport-mobile-after.png', fullPage: true })

      // Then: No React errors should occur
      const relevantErrors = pageErrors.filter(error => {
        const message = error.message || error.toString()
        return !message.includes('IpcRendererEventBus') &&
               !message.includes('componentWillReceiveProps') &&
               !message.includes('locale') &&
               !message.includes('ACE editor')
      })

      const reactErrors = consoleMessages.filter(msg => 
        msg.toLowerCase().includes('error') &&
        (msg.includes('React') || msg.includes('react') || msg.includes('Warning:'))
      )

      if (relevantErrors.length > 0) {
        console.error('Page errors detected:')
        relevantErrors.forEach(err => console.error('  -', err.message))
      }

      if (reactErrors.length > 0) {
        console.error('React errors detected:')
        reactErrors.forEach(msg => console.error('  -', msg))
      }

      expect(relevantErrors.length, 'Should have no relevant page errors').to.equal(0)
      expect(reactErrors.length, 'Should have no React console errors').to.equal(0)
    })

    it('should handle multiple rapid viewport changes', async function () {
      console.log('Testing rapid viewport changes...')
      
      // Clear previous errors
      const pageErrors = (page as any).testPageErrors as Error[]
      const consoleMessages = (page as any).testConsoleMessages as string[]
      pageErrors.length = 0
      consoleMessages.length = 0

      // Rapidly switch between viewports
      const viewports = [
        { width: 600, height: 800, name: 'mobile' },    // < 768
        { width: 900, height: 600, name: 'desktop' },   // > 768
        { width: 700, height: 800, name: 'mobile' },    // < 768
        { width: 1024, height: 768, name: 'desktop' },  // > 768
        { width: 412, height: 914, name: 'mobile' },    // < 768
      ]

      for (const vp of viewports) {
        console.log(`Switching to ${vp.name} (${vp.width}x${vp.height})...`)
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await sleep(500) // Short delay between switches
      }

      await sleep(2000) // Final settle time
      await page.screenshot({ path: 'test-viewport-rapid-changes.png', fullPage: true })

      // Check for errors
      const relevantErrors = pageErrors.filter(error => {
        const message = error.message || error.toString()
        return !message.includes('IpcRendererEventBus') &&
               !message.includes('componentWillReceiveProps') &&
               !message.includes('locale') &&
               !message.includes('ACE editor')
      })

      const reactErrors = consoleMessages.filter(msg => 
        msg.toLowerCase().includes('error') &&
        (msg.includes('React') || msg.includes('react') || msg.includes('Warning:'))
      )

      if (relevantErrors.length > 0) {
        console.error('Page errors detected:')
        relevantErrors.forEach(err => console.error('  -', err.message))
      }

      if (reactErrors.length > 0) {
        console.error('React errors detected:')
        reactErrors.forEach(msg => console.error('  -', msg))
      }

      expect(relevantErrors.length, 'Should have no relevant page errors').to.equal(0)
      expect(reactErrors.length, 'Should have no React console errors').to.equal(0)
    })
  })
})
