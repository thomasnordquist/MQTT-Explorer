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
 * MQTT Explorer UI Tests - Fully Isolated Test Suite
 * 
 * Each test:
 * 1. Gets fresh page
 * 2. Mocks only the MQTT messages it needs (no timers)
 * 3. Connects to broker
 * 4. Tests functionality using expandTopic
 * 5. Reloads page for next test
 * 
 * This ensures complete test isolation with no state carryover.
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
describe('MQTT Explorer UI Tests', function () {
  this.timeout(60000)

  let electronApp: ElectronApplication
  let testMock: MqttClient

  before(async function () {
    this.timeout(90000)

    console.log('Creating test-specific MQTT mock (no timers)...')
    testMock = await createTestMock()

    console.log('Launching Electron application...')
    electronApp = await electron.launch({
      args: [`${__dirname}/../../..`, '--runningUiTestOnCi', '--no-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000,
    })
  })

  after(async function () {
    this.timeout(10000)

    if (electronApp) {
      await electronApp.close()
    }

    stopTestMock()
  })

  // Helper function to get a fresh page
  async function getFreshPage(): Promise<Page> {
    const page = await electronApp.firstWindow({ timeout: 30000 })
    await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })
    return page
  }

  describe('Connection Management', () => {
    it('should connect and expand livingroom/lamp topic', async function () {
      // Given: Fresh page and mocked topic
      const page = await getFreshPage()
      testMock.publish('livingroom/lamp/state', 'on', { retain: true, qos: 0 })
      await sleep(500) // Let MQTT message propagate

      // When: Connect and expand topic
      await connectTo('127.0.0.1', page)
      await sleep(2000)
      await expandTopic('livingroom/lamp', page)

      // Then: Should see lamp state
      const stateTopic = await page.locator('span[data-test-topic="state"]')
      await stateTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await stateTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-connection.png' })

      // Clean up: Reload page
      await page.reload()
    })
  })

  describe('Topic Tree Structure', () => {
    it('should expand and display kitchen/coffee_maker with JSON payload', async function () {
      // Given: Fresh page and mocked JSON message
      const page = await getFreshPage()
      const coffeeData = {
        heater: 'on',
        temperature: 92.5,
        waterLevel: 0.5,
      }
      testMock.publish('kitchen/coffee_maker', JSON.stringify(coffeeData), { retain: true, qos: 2 })
      await sleep(500)

      // When: Connect and expand topic
      await connectTo('127.0.0.1', page)
      await sleep(2000)
      await expandTopic('kitchen/coffee_maker', page)

      // Then: JSON content should be visible (check for heater key)
      const valueDisplay = await page.locator('text="heater"')
      await valueDisplay.waitFor({ state: 'visible', timeout: 5000 })
      expect(await valueDisplay.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-kitchen-json.png' })

      // Clean up: Reload page
      await page.reload()
    })

    it('should expand nested topic livingroom/lamp/brightness', async function () {
      // Given: Fresh page and nested mocked topic
      const page = await getFreshPage()
      testMock.publish('livingroom/lamp/brightness', '128', { retain: true, qos: 0 })
      await sleep(500)

      // When: Connect and expand to nested topic
      await connectTo('127.0.0.1', page)
      await sleep(2000)
      await expandTopic('livingroom/lamp/brightness', page)

      // Then: Brightness topic should be visible and selected
      const brightnessTopic = await page.locator('span[data-test-topic="brightness"]')
      await brightnessTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await brightnessTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-nested-topic.png' })

      // Clean up: Reload page
      await page.reload()
    })
  })

  describe('Search Functionality', () => {
    it('should search for temperature and expand kitchen/temperature', async function () {
      // Given: Fresh page and mocked temperature topics
      const page = await getFreshPage()
      testMock.publish('kitchen/temperature', '22.5', { retain: true, qos: 0 })
      testMock.publish('livingroom/temperature', '21.0', { retain: true, qos: 0 })
      await sleep(500)

      // When: Connect, search, and expand
      await connectTo('127.0.0.1', page)
      await sleep(2000)
      await searchTree('temp', page)
      await sleep(1000)
      await clearSearch(page)
      await sleep(500)
      await expandTopic('kitchen/temperature', page)

      // Then: Temperature topic should be visible
      const tempTopic = await page.locator('span[data-test-topic="temperature"]')
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search-temp.png' })

      // Clean up: Reload page
      await page.reload()
    })

    it('should search for lamp and expand kitchen/lamp', async function () {
      // Given: Fresh page and mocked lamp topics
      const page = await getFreshPage()
      testMock.publish('kitchen/lamp/state', 'off', { retain: true, qos: 0 })
      testMock.publish('livingroom/lamp/state', 'on', { retain: true, qos: 0 })
      await sleep(500)

      // When: Connect, search, and expand
      await connectTo('127.0.0.1', page)
      await sleep(2000)
      await searchTree('kitchen/lamp', page)
      await sleep(1000)
      await clearSearch(page)
      await sleep(500)
      await expandTopic('kitchen/lamp', page)

      // Then: Lamp topic should be visible
      const lampTopic = await page.locator('span[data-test-topic="lamp"]')
      await lampTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await lampTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search-lamp.png' })

      // Clean up: Reload page
      await page.reload()
    })
  })
})
