import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { Browser, BrowserContext, Page, chromium } from 'playwright'

import mockMqtt, { stop as stopMqtt } from './mock-mqtt'
import { default as MockSparkplug } from './mock-sparkplugb'
import { clearSearch, searchTree } from './scenarios/searchTree'
import { clickOn, clickOnHistory, createFakeMousePointer, hideText, showText, sleep } from './util'
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
import { expandTopic } from './util/expandTopic'
import { selectTopic } from './util/selectTopic'

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
  // headless: false is required so the browser renders to the X display for video recording
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--app=http://localhost:3000', // App mode - no browser UI
      '--window-size=412,914', // Match the mobile viewport size
      '--window-position=0,0',
      '--disable-features=TranslateUI',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-infobars',
      '--disable-translate',
    ],
  })

  // Create browser context with Pixel 6 viewport
  // Note: Height must be even for video encoding (h264 requirement)
  const context = await browser.newContext({
    viewport: {
      width: 412,
      height: 914, // Changed from 915 to 914 (must be even for h264)
    },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36',
  })

  const page = await context.newPage()

  // Navigate to the browser mode server
  const serverUrl = process.env.BROWSER_MODE_URL || 'http://localhost:3000'
  console.log(`Navigating to ${serverUrl}`)
  await page.goto(serverUrl, { waitUntil: 'networkidle' })

  // Print the title
  console.log(await page.title())

  // Try to capture a screenshot (may fail in headed mode, but that's ok)
  try {
    await page.screenshot({ path: 'intro-mobile.png' })
  } catch (error) {
    console.log('Screenshot skipped (headed mode)')
  }

  // Direct console to Node terminal
  page.on('console', console.log)

  // Enable the fake mouse pointer for visual cursor tracking
  await createFakeMousePointer(page)

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
    await sleep(3000) // Give more time for topics to load
    await hideText(page)
  })

  await scenes.record('mobile_browse_topics', async () => {
    await showText('Browse Topics - Topics Tab', 1500, page, 'top')
    await sleep(2000)
    // Wait for tree nodes to be visible
    await page.waitForSelector('[data-test-topic]', { timeout: 10000 }).catch(() => {
      console.log('Tree nodes not found, continuing...')
    })
    await sleep(1000)

    try {
      // Expand topics using the expandTopic utility
      // On mobile, this clicks expand buttons (▶/▼) to navigate the tree
      await showText('Expand Topic Tree', 1000, page, 'top')
      await sleep(500)
      await expandTopic('livingroom/lamp', page)
      await sleep(1500)
    } catch (error) {
      console.log('Topic expansion failed, continuing...', error)
    }

    await hideText(page)
  })

  await scenes.record('mobile_view_message', async () => {
    await showText('Tap Topic to View Details', 1500, page, 'top')
    await sleep(1000)

    try {
      // Select a topic by clicking its text
      // On mobile, this will switch to the Details tab automatically
      await selectTopic('livingroom/lamp/state', page)
      await sleep(2000)
      // The mobile UI should now show the Details tab with the selected topic
      await showText('Details Tab Activated', 1000, page, 'top')
      await sleep(1500)
    } catch (error) {
      console.log('Topic selection failed, continuing...', error)
    }

    await hideText(page)
  })

  await scenes.record('mobile_search', async () => {
    await showText('Search Topics', 1500, page, 'top')
    await sleep(500)
    await searchTree('temp', page)
    await sleep(1500)
    await showText('Filter Results', 1000, page, 'top')
    await sleep(1500)
    await clearSearch(page)
    await sleep(1000)
    await hideText(page)
  })

  await scenes.record('mobile_json_view', async () => {
    await showText('JSON Message Formatting', 1500, page, 'top')
    await sleep(1000)

    try {
      // Navigate back to Topics tab to show tree navigation
      const topicsTab = page.locator('button:has-text("TOPICS"), button:has-text("Topics")')
      const topicsTabVisible = await topicsTab.isVisible().catch(() => false)
      if (topicsTabVisible) {
        await topicsTab.click()
        await sleep(1000)
      }

      // Expand and select kitchen/coffee_maker to show JSON
      await expandTopic('kitchen/coffee_maker', page)
      await sleep(1000)
      await selectTopic('kitchen/coffee_maker', page)
      await sleep(2000)

      await showText('JSON Payload View', 1000, page, 'top')
      await sleep(1500)
    } catch (error) {
      console.log('JSON view navigation failed, continuing...', error)
    }

    await hideText(page)
  })

  await scenes.record('mobile_settings', async () => {
    try {
      await showText('Settings with Disconnect/Logout', 1500, page, 'top')
      await sleep(2000)
      // Just show that settings are available, don't click
      await hideText(page)
    } catch (error) {
      console.log('Settings scene failed, continuing...', error)
      // Try to dismiss any error dialogs
      try {
        const closeButton = page.locator('button:has-text("Close"), button[aria-label="close"]')
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click()
          await sleep(500)
        }
      } catch (e) {
        // Ignore if we can't close dialog
      }
    }
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
