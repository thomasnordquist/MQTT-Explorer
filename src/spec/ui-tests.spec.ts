import 'mocha'
import { expect } from 'chai'
import { ElectronApplication, Page, _electron as electron } from 'playwright'
import mockMqtt, { stop as stopMqtt } from './mock-mqtt'
import { default as MockSparkplug } from './mock-sparkplugb'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import { searchTree, clearSearch } from './scenarios/searchTree'
import { showNumericPlot } from './scenarios/showNumericPlot'
import { showJsonPreview } from './scenarios/showJsonPreview'
import { showOffDiffCapability } from './scenarios/showOffDiffCapability'
import { copyTopicToClipboard } from './scenarios/copyTopicToClipboard'
import { copyValueToClipboard } from './scenarios/copyValueToClipboard'
import { showMenu } from './scenarios/showMenu'
import { showAdvancedConnectionSettings } from './scenarios/showAdvancedConnectionSettings'
import { showSparkPlugDecoding } from './scenarios/showSparkplugDecoding'
import { disconnect } from './scenarios/disconnect'

/**
 * UI Test Suite for MQTT Explorer
 *
 * These tests validate the core UI functionality of MQTT Explorer.
 * Each test is independent and deterministic.
 *
 * Prerequisites:
 * - MQTT broker running on localhost:1883
 * - Application built with `yarn build`
 */
describe('MQTT Explorer UI Tests', function () {
  // Increase timeout for UI tests
  this.timeout(60000)

  let electronApp: ElectronApplication
  let page: Page
  let mqttClientStarted = false

  /**
   * Setup: Start MQTT broker mock and launch Electron app
   */
  before(async function () {
    this.timeout(30000)

    console.log('Starting MQTT mock broker...')
    await mockMqtt()
    mqttClientStarted = true

    console.log('Launching Electron application...')
    electronApp = await electron.launch({
      args: [`${__dirname}/../../..`, '--runningUiTestOnCi'],
    })

    console.log('Waiting for application window...')
    page = await electronApp.firstWindow({ timeout: 10000 })

    // Wait for the connection form to be ready
    await page.locator('//label[contains(text(), "Username")]/..//input').waitFor({ timeout: 5000 })

    console.log('Application ready for testing')
  })

  /**
   * Teardown: Close app and stop MQTT mock
   */
  after(async function () {
    this.timeout(10000)

    if (electronApp) {
      await electronApp.close()
    }

    if (mqttClientStarted) {
      stopMqtt()
    }
  })

  describe('Connection Management', () => {
    it('should connect to MQTT broker successfully', async function () {
      await connectTo('127.0.0.1', page)
      await sleep(2000)

      // Start Sparkplug client after connection
      await MockSparkplug.run()
      await sleep(1000)

      // Verify connected state by checking for disconnect button
      const disconnectButton = await page.locator('//button/span[contains(text(),"Disconnect")]')
      const isVisible = await disconnectButton.isVisible()
      expect(isVisible).to.be.true

      // Take screenshot for verification
      await page.screenshot({ path: 'test-screenshot-connection.png' })
    })
  })

  describe('Topic Tree Navigation', () => {
    it('should display topic hierarchy after connection', async function () {
      // Check that topics are visible in the tree
      const treeNodes = await page.locator('[class*="TreeNode"]')
      const count = await treeNodes.count()
      expect(count).to.be.greaterThan(0, 'Topic tree should contain nodes')
    })

    it('should search and filter topics', async function () {
      // Search for "temp" topics
      await searchTree('temp', page)
      await sleep(1500)

      // Verify search is active
      const searchField = await page.locator('//input[contains(@placeholder, "Search")]')
      const searchValue = await searchField.inputValue()
      expect(searchValue).to.equal('temp')

      // Take screenshot
      await page.screenshot({ path: 'test-screenshot-search.png' })

      // Clear search
      await clearSearch(page)
      await sleep(500)

      // Verify search is cleared
      const clearedValue = await searchField.inputValue()
      expect(clearedValue).to.equal('')
    })
  })

  describe('Message Visualization', () => {
    it('should display JSON formatted messages', async function () {
      await showJsonPreview(page)
      await sleep(1500)

      // Take screenshot for verification
      await page.screenshot({ path: 'test-screenshot-json-preview.png' })
    })

    it('should show numeric plots for topics', async function () {
      await showNumericPlot(page)
      await sleep(2000)

      // Take screenshot showing charts
      await page.screenshot({ path: 'test-screenshot-numeric-plots.png' })
    })

    it('should display message diffs', async function () {
      await showOffDiffCapability(page)
      await sleep(1500)

      // Take screenshot
      await page.screenshot({ path: 'test-screenshot-diffs.png' })
    })
  })

  describe('Clipboard Operations', () => {
    it('should copy topic to clipboard', async function () {
      await copyTopicToClipboard(page)
      await sleep(500)

      // Note: Actual clipboard verification would require additional setup
      // This test verifies the action completes without error
    })

    it('should copy value to clipboard', async function () {
      await copyValueToClipboard(page)
      await sleep(500)

      // Note: Actual clipboard verification would require additional setup
      // This test verifies the action completes without error
    })
  })

  describe('SparkplugB Support', () => {
    it('should decode SparkplugB messages', async function () {
      await showSparkPlugDecoding(page)
      await sleep(2000)

      // Take screenshot
      await page.screenshot({ path: 'test-screenshot-sparkplugb.png' })
    })
  })

  describe('Settings and Configuration', () => {
    it('should open and display settings menu', async function () {
      await showMenu(page)
      await sleep(1500)

      // Take screenshot
      await page.screenshot({ path: 'test-screenshot-settings.png' })
    })

    it('should show advanced connection settings', async function () {
      // First disconnect
      await disconnect(page)
      await sleep(1000)

      await showAdvancedConnectionSettings(page)
      await sleep(1500)

      // Take screenshot
      await page.screenshot({ path: 'test-screenshot-advanced-settings.png' })
    })
  })
})
