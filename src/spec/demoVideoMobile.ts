import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { Browser, BrowserContext, Page, chromium } from 'playwright'

import mockMqtt, { stop as stopMqtt } from './mock-mqtt'
import { default as MockSparkplug } from './mock-sparkplugb'
import { clearSearch, searchTree } from './scenarios/searchTree'
import { clickOnHistory, createFakeMousePointer, hideText, showText, sleep } from './util'
import { connectTo } from './scenarios/connect'
import { copyTopicToClipboard } from './scenarios/copyTopicToClipboard'
import { copyValueToClipboard } from './scenarios/copyValueToClipboard'
import { disconnect } from './scenarios/disconnect'
import { publishTopic } from './scenarios/publishTopic'
import { Scene, SceneBuilder } from './SceneBuilder'
import { showAdvancedConnectionSettings } from './scenarios/showAdvancedConnectionSettings'
import { showJsonPreview } from './scenarios/showJsonPreview'
import { showMenu } from './scenarios/showMenu'
import { showNumericPlot } from './scenarios/showNumericPlot'
import { showOffDiffCapability } from './scenarios/showOffDiffCapability'

/**
 * Mobile Demo Video - Pixel 6 viewport
 * 
 * This demo showcases MQTT Explorer running in a mobile browser viewport
 * simulating a Google Pixel 6 (412x915px portrait mode)
 */

/**
 *  A convenience method that handles gracefully cleaning up the test run.
 */
const cleanUp = async (scenes: SceneBuilder, browser: Browser) => {
  // Exit app.
  fs.writeFileSync('scenes-mobile.json', JSON.stringify(scenes.scenes, undefined, '  '))
  await browser.close()
}

process.on('unhandledRejection' as any, (error: Error | any) => {
  console.error('unhandledRejection', error.message, error.stack)
  process.exit(1)
})

setTimeout(
  () => {
    console.error('Timeout reached')
    process.exit(1)
  },
  60 * 10 * 1000
)

async function doStuff() {
  const brokerHost = process.env.TESTS_MQTT_BROKER_HOST || '127.0.0.1'
  const brokerPort = process.env.TESTS_MQTT_BROKER_PORT || '1883'
  console.log(`Waiting for MQTT Broker at ${brokerHost}:${brokerPort} (no auth)`)
  await mockMqtt()

  console.log('Starting playwright/chromium in mobile mode (Pixel 6)')

  // Launch Chromium browser with mobile emulation
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  // Create browser context with Pixel 6 viewport
  const context = await browser.newContext({
    viewport: {
      width: 412,
      height: 915,
    },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',
  })

  const page = await context.newPage()

  // Navigate to the browser mode server
  const serverUrl = process.env.BROWSER_MODE_URL || 'http://localhost:3000'
  console.log(`Navigating to ${serverUrl}`)
  await page.goto(serverUrl, { waitUntil: 'networkidle' })

  // Print the title
  console.log(await page.title())
  
  // Capture a screenshot
  await page.screenshot({ path: 'intro-mobile.png' })
  
  // Direct console to Node terminal
  page.on('console', console.log)

  // Handle authentication if required
  const username = process.env.MQTT_EXPLORER_USERNAME || 'admin'
  const password = process.env.MQTT_EXPLORER_PASSWORD || 'password'

  console.log('Waiting for page to initialize...')
  await sleep(3000)

  // Check for login dialog
  const loginDialog = page.locator('h2:has-text("Login to MQTT Explorer")')
  let loginDialogVisible = false
  try {
    loginDialogVisible = await loginDialog.isVisible({ timeout: 5000 })
  } catch (error) {
    console.log('Login dialog not found - auth may be disabled')
  }

  if (loginDialogVisible) {
    console.log('Handling authentication...')
    const usernameInput = page.locator('input[name="username"]')
    const passwordInput = page.locator('input[name="password"]')
    const loginButton = page.locator('button:has-text("Login")')

    await usernameInput.fill(username)
    await passwordInput.fill(password)
    await loginButton.click()
    await sleep(2000)
  }

  // Wait for the connection UI to be visible
  await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })

  const scenes = new SceneBuilder()
  
  await scenes.record('mobile_intro', async () => {
    await showText('MQTT Explorer on Mobile', 2000, page, 'middle')
    await sleep(2500)
    await showText('Google Pixel 6 (412x915)', 1500, page, 'middle')
    await sleep(2000)
    await hideText(page)
  })

  await scenes.record('mobile_connect', async () => {
    await showText('Connect to MQTT Broker', 1500, page, 'top')
    await connectTo(brokerHost, page)
    await MockSparkplug.run() // Start sparkplug client after connect
    await sleep(2000)
    await hideText(page)
  })

  await scenes.record('mobile_browse_topics', async () => {
    await showText('Browse Topic Tree', 1500, page, 'top')
    await sleep(1500)
    // Try to expand a topic in the tree
    const firstTopic = page.locator('[data-testid="tree-node"]').first()
    if (await firstTopic.isVisible()) {
      await firstTopic.click()
      await sleep(1000)
    }
    await sleep(1500)
    await hideText(page)
  })

  await scenes.record('mobile_search', async () => {
    await showText('Search Topics', 1500, page, 'top')
    await searchTree('temp', page)
    await sleep(1500)
    await showText('Filter Results', 1000, page, 'top')
    await sleep(1500)
    await clearSearch(page)
    await sleep(1000)
    await hideText(page)
  })

  await scenes.record('mobile_view_message', async () => {
    await showText('View Message Details', 1500, page, 'top')
    await sleep(1000)
    // Click on a topic to view details in sidebar
    const topicNode = page.locator('[data-testid="tree-node"]').first()
    if (await topicNode.isVisible()) {
      await topicNode.click()
      await sleep(2000)
    }
    await hideText(page)
  })

  await scenes.record('mobile_json_view', async () => {
    await showText('JSON Message Formatting', 1500, page, 'top')
    await showJsonPreview(page)
    await sleep(2000)
    await hideText(page)
  })

  await scenes.record('mobile_clipboard', async () => {
    await showText('Copy to Clipboard', 1500, page, 'top')
    await copyTopicToClipboard(page)
    await sleep(1000)
    await copyValueToClipboard(page)
    await sleep(1500)
    await hideText(page)
  })

  await scenes.record('mobile_plots', async () => {
    await showText('View Numeric Plots', 1500, page, 'top')
    await showNumericPlot(page)
    await sleep(2500)
    await hideText(page)
  })

  await scenes.record('mobile_menu', async () => {
    await showText('Settings & Menu', 1500, page, 'top')
    await showMenu(page)
    await sleep(2000)
    await hideText(page)
  })

  await scenes.record('mobile_end', async () => {
    await showText('Mobile-Friendly MQTT Explorer', 2000, page, 'middle')
    await sleep(2500)
    await showText('Ready for Optimization', 1500, page, 'middle')
    await sleep(2000)
  })

  setTimeout(() => {
    console.log('Forced quit')
    process.exit(0)
  }, 10 * 1000)
  
  stopMqtt()
  console.log('Stopped mqtt client')

  await cleanUp(scenes, browser)

  // Force exit since there appear to be open handles
  process.exit(0)
}

doStuff()
