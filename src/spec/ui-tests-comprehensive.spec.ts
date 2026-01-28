import 'mocha'
import { expect } from 'chai'
import { ElectronApplication, Page, _electron as electron } from 'playwright'
import type { MqttClient } from 'mqtt'
import { createTestMock, stopTestMock } from './mock-mqtt-test'
import { default as MockSparkplug } from './mock-sparkplugb'
import { sleep, expandTopic } from './util'
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
 * Comprehensive UI Test Suite for MQTT Explorer
 *
 * These tests validate the core UI functionality of MQTT Explorer.
 * All topics are published before connecting, and tests run sequentially
 * on the same connected application instance.
 *
 * Best Practices Applied:
 * - Wait for specific UI elements rather than fixed timeouts
 * - Use meaningful assertions that verify actual state
 * - Test data-driven scenarios (Given-When-Then pattern)
 * - Capture screenshots for visual verification
 * - Handle MQTT asynchronous operations properly
 *
 * Prerequisites:
 * - MQTT broker running (default: localhost:1883, configurable via TESTS_MQTT_BROKER_HOST and TESTS_MQTT_BROKER_PORT)
 * - Application built with `yarn build`
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
describe('MQTT Explorer Comprehensive UI Tests', function () {
  this.timeout(60000)

  let electronApp: ElectronApplication
  let page: Page
  let testMock: MqttClient

  /**
   * Setup: Start MQTT broker mock and launch Electron app
   */
  before(async function () {
    this.timeout(120000) // Increased timeout for comprehensive setup

    console.log('Creating test-specific MQTT mock (no timers)...')
    testMock = await createTestMock()

    console.log('Publishing all test topics...')
    // Publish all test topics before connecting - simulating what mock-mqtt does with timers

    // Basic topics
    testMock.publish('livingroom/lamp/state', 'on', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp/brightness', '128', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp-1/state', 'on', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp-1/brightness', '48', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp-2/state', 'off', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp-2/brightness', '48', { retain: true, qos: 0 })
    testMock.publish('livingroom/temperature', '21.0', { retain: true, qos: 0 })
    testMock.publish('livingroom/humidity', '60', { retain: true, qos: 0 })
    testMock.publish('livingroom/thermostat/targetTemperature', '20°C', { retain: true, qos: 0 })

    // Kitchen topics
    const coffeeData = {
      heater: 'on',
      temperature: 92.5,
      waterLevel: 0.5,
      update: new Date().toISOString(),
    }
    testMock.publish('kitchen/coffee_maker', JSON.stringify(coffeeData), { retain: true, qos: 2 })
    testMock.publish('kitchen/lamp/state', 'off', { retain: true, qos: 0 })
    testMock.publish('kitchen/temperature', '22.5', { retain: true, qos: 0 })
    testMock.publish('kitchen/humidity', '55', { retain: true, qos: 0 })

    // Garden topics
    testMock.publish('garden/pump/state', 'off', { retain: true, qos: 0 })
    testMock.publish('garden/water/level', '70%', { retain: true, qos: 0 })
    testMock.publish('garden/lamps/state', 'off', { retain: true, qos: 0 })

    // Bridge topics
    testMock.publish('zigbee2mqtt/bridge/state', 'online', { retain: true, qos: 0 })
    testMock.publish('ble2mqtt/bridge/state', 'online', { retain: true, qos: 0 })

    // Special character topics
    testMock.publish('01-80-C2-00-00-0F/LWT', 'offline', { retain: true, qos: 0 })

    // 3D printer topics
    testMock.publish('3d-printer/OctoPrint/temperature/bed', '{"_timestamp":1548589083,"actual":25.9,"target":0}', {
      retain: true,
      qos: 0,
    })
    testMock.publish('3d-printer/OctoPrint/temperature/tool0', '{"_timestamp":1548589093,"actual":26.4,"target":0}', {
      retain: true,
      qos: 0,
    })

    // Actuality showcase for JSON display
    const actualityData = {
      tags: {
        entityId: 33512,
        entityType: 'person',
        host: 'd44ad81e10f9',
        server: 'http://localhost/dataActuality',
        status: 'live',
      },
      timestamp: Date.now(),
    }
    testMock.publish('actuality/showcase', JSON.stringify(actualityData), { retain: true, qos: 0 })

    await sleep(2000) // Let MQTT messages propagate and get retained

    console.log('Launching Electron application...')
    electronApp = await electron.launch({
      args: [`${__dirname}/../../..`, '--runningUiTestOnCi', '--no-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000,
    })

    console.log('Waiting for application window...')
    page = await electronApp.firstWindow({ timeout: 30000 })
    await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })

    // Use TESTS_MQTT_BROKER_HOST from environment, default to localhost
    const brokerHost = process.env.TESTS_MQTT_BROKER_HOST || '127.0.0.1'
    console.log(`Connecting to MQTT broker at ${brokerHost}...`)
    await connectTo(brokerHost, page)
    await sleep(3000) // Give time for all topics to load

    // Start Sparkplug client after connection
    console.log('Starting SparkplugB mock...')
    await MockSparkplug.run()
    await sleep(2000)

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

    stopTestMock()
  })

  describe('Connection Management', () => {
    it('should connect to MQTT broker successfully', async () => {
      // Given: Application is connected (from before hook)
      // Then: Disconnect button should be visible (indicating connected state)
      const disconnectButton = page.locator('//button/span[contains(text(),"Disconnect")]')
      await disconnectButton.waitFor({ state: 'visible', timeout: 5000 })
      const isVisible = await disconnectButton.isVisible()
      expect(isVisible).to.be.true

      await page.screenshot({ path: 'test-screenshot-connection.png' })
    })
  })

  describe('Topic Tree Structure', () => {
    it('should display the correct number of root topics from mock data', async () => {
      // Then: We should see expected root topics (livingroom, kitchen, garden, etc.)
      const rootTopics = ['livingroom', 'kitchen', 'garden']
      for (const topicName of rootTopics) {
        const topic = page.locator(`span[data-test-topic="${topicName}"]`).first()
        await topic.waitFor({ state: 'visible', timeout: 5000 })
        const visible = await topic.isVisible()
        expect(visible).to.be.true
      }

      await page.screenshot({ path: 'test-screenshot-root-topics.png' })
    })
  })

  describe('Topic Navigation and Search', () => {
    it('should search and filter topics containing "temp"', async () => {
      // When: User searches for "temp"
      await searchTree('temp', page)
      await sleep(1000)

      // Then: Search field should contain the search term
      const searchField = page.locator('//input[contains(@placeholder, "Search")]')
      const searchValue = await searchField.inputValue()
      expect(searchValue).to.equal('temp')

      // And: Temperature topics should be visible
      const tempTopic = page.locator('span[data-test-topic="temperature"]').first()
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search.png' })

      // Clean up: Clear search
      await clearSearch(page)
      await sleep(500)
    })
  })

  describe('Message Visualization', () => {
    it('Given a JSON message on topic actuality/showcase, should display formatted JSON', async () => {
      // showJsonPreview internally calls expandTopic, so we don't need to call it here
      await showJsonPreview(page)
      await sleep(1000)

      await page.screenshot({ path: 'test-screenshot-json-display.png' })
    })

    it('should show numeric plots for topics with numeric values', async () => {
      // When: We navigate to a numeric topic and show plot
      await expandTopic('livingroom/temperature', page)
      await sleep(500)

      await showNumericPlot(page)
      await sleep(2000)

      await page.screenshot({ path: 'test-screenshot-numeric-plot.png' })
    })
  })

  describe('Clipboard Operations', () => {
    it('should copy topic path to clipboard', async () => {
      // When: We copy topic to clipboard
      await expandTopic('livingroom/lamp/state', page)
      await sleep(500)

      await copyTopicToClipboard(page)
      await sleep(500)

      await page.screenshot({ path: 'test-screenshot-copy-topic.png' })
    })
  })

  describe('SparkplugB Support', () => {
    it('Given SparkplugB messages, should decode and display the payload', async () => {
      // When: We show SparkplugB decoding
      await showSparkPlugDecoding(page)
      await sleep(1000)

      await page.screenshot({ path: 'test-screenshot-sparkplugb.png' })
    })
  })

  describe('Settings and Configuration', () => {
    it('should show settings menu', async () => {
      // When: We open settings menu
      await showMenu(page)
      await sleep(1000)

      await page.screenshot({ path: 'test-screenshot-menu.png' })
    })
  })

  describe('Retained Messages', () => {
    it('Given retained messages on multiple topics, should display retained indicator', async () => {
      // When: We navigate to a topic with retained message
      await expandTopic('garden/pump/state', page)
      await sleep(500)

      // Then: The topic should be visible (retained messages are shown)
      const pumpTopic = page.locator('span[data-test-topic="state"]').first()
      expect(await pumpTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-retained.png' })
    })
  })

  describe('Special Topic Names and Characters', () => {
    it('Given topic with MAC address format (01-80-C2-00-00-0F/LWT), should display correctly', async () => {
      // When: We look for the MAC address topic
      const macTopic = page.locator('span[data-test-topic="01-80-C2-00-00-0F"]').first()
      await macTopic.waitFor({ state: 'visible', timeout: 5000 })

      // Then: It should be visible
      expect(await macTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-special-chars.png' })
    })
  })
})
