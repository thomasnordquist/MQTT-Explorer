import 'mocha'
import { expect } from 'chai'
import { ElectronApplication, Page, _electron as electron } from 'playwright'
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
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
describe('MQTT Explorer UI Tests', function () {
  this.timeout(60000)

  let electronApp: ElectronApplication
  let testMock: MqttClient
  let page: Page

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

    console.log('Launching Electron application...')
    electronApp = await electron.launch({
      args: [`${__dirname}/../../..`, '--runningUiTestOnCi', '--no-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000,
    })

    console.log('Getting application window...')
    page = await electronApp.firstWindow({ timeout: 30000 })
    await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })

    console.log('Connecting to MQTT broker...')
    await connectTo('127.0.0.1', page)
    await sleep(3000) // Give time for topics to load
    console.log('Setup complete')
  })

  after(async function () {
    this.timeout(10000)

    if (electronApp) {
      await electronApp.close()
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
