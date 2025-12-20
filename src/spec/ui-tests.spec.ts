import 'mocha'
import { expect } from 'chai'
import { ElectronApplication, Page, _electron as electron } from 'playwright'
import mockMqtt, { stop as stopMqtt } from './mock-mqtt'
import { default as MockSparkplug } from './mock-sparkplugb'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import { searchTree, clearSearch } from './scenarios/searchTree'

/**
 * MQTT Explorer UI Tests - Fully Isolated Test Suite
 * 
 * Each test is completely independent with its own page reload for clean state.
 * This ensures no test interference or state carryover.
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
describe('MQTT Explorer UI Tests', function () {
  this.timeout(60000)

  let electronApp: ElectronApplication
  let mqttClientStarted = false

  before(async function () {
    this.timeout(30000)

    console.log('Starting MQTT mock broker...')
    await mockMqtt()
    mqttClientStarted = true

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

    if (mqttClientStarted) {
      stopMqtt()
    }
  })

  // Helper function to get a fresh page
  async function getFreshPage(): Promise<Page> {
    const page = await electronApp.firstWindow({ timeout: 30000 })
    await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })
    return page
  }

  describe('Connection Management', () => {
    it('should connect to MQTT broker successfully', async function () {
      // Given: Fresh page
      const page = await getFreshPage()

      // When: Connect to MQTT broker
      await connectTo('127.0.0.1', page)
      await sleep(1000)

      await MockSparkplug.run()
      await sleep(1000)

      // Then: Disconnect button should be visible
      const disconnectButton = await page.locator('//button/span[contains(text(),"Disconnect")]')
      await disconnectButton.waitFor({ state: 'visible', timeout: 5000 })
      const isVisible = await disconnectButton.isVisible()
      expect(isVisible).to.be.true

      await page.screenshot({ path: 'test-screenshot-connection.png' })

      // Clean up: Reload page for next test
      await page.reload()
    })
  })

  describe('Topic Tree Structure', () => {
    it('should display kitchen topic from mock data', async function () {
      // Given: Fresh page and connected
      const page = await getFreshPage()
      await connectTo('127.0.0.1', page)
      await sleep(2000)

      // Then: Kitchen topic should be visible
      const kitchenTopic = await page.locator('span[data-test-topic="kitchen"]')
      await kitchenTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await kitchenTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-kitchen.png' })

      // Clean up: Reload page
      await page.reload()
    })

    it('should display root topics from mock data', async function () {
      // Given: Fresh page and connected
      const page = await getFreshPage()
      await connectTo('127.0.0.1', page)
      await sleep(2000)

      // Then: All root topics should be visible
      const rootTopics = ['livingroom', 'kitchen', 'garden']
      for (const topicName of rootTopics) {
        const topic = await page.locator(`span[data-test-topic="${topicName}"]`)
        await topic.waitFor({ state: 'visible', timeout: 5000 })
        const visible = await topic.isVisible()
        expect(visible).to.be.true
      }

      await page.screenshot({ path: 'test-screenshot-root-topics.png' })

      // Clean up: Reload page
      await page.reload()
    })
  })

  describe('Search Functionality', () => {
    it('should search and filter topics containing "temp"', async function () {
      // Given: Fresh page and connected
      const page = await getFreshPage()
      await connectTo('127.0.0.1', page)
      await sleep(2000)

      // When: Search for "temp"
      await searchTree('temp', page)
      await sleep(1000)

      // Then: Search field should contain "temp" and temperature topic should be visible
      const searchField = await page.locator('//input[contains(@placeholder, "Search")]')
      const searchValue = await searchField.inputValue()
      expect(searchValue).to.equal('temp')

      const tempTopic = await page.locator('span[data-test-topic="temperature"]').first()
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search.png' })

      // Clean up: Reload page
      await page.reload()
    })

    it('should search for specific topic path like "kitchen/lamp"', async function () {
      // Given: Fresh page and connected
      const page = await getFreshPage()
      await connectTo('127.0.0.1', page)
      await sleep(2000)

      // When: Search for "kitchen/lamp"
      await searchTree('kitchen/lamp', page)
      await sleep(1000)

      // Then: Search field should contain "kitchen/lamp"
      const searchField = await page.locator('//input[contains(@placeholder, "Search")]')
      const searchValue = await searchField.inputValue()
      expect(searchValue).to.equal('kitchen/lamp')

      await page.screenshot({ path: 'test-screenshot-search-path.png' })

      // Clean up: Reload page
      await page.reload()
    })
  })
})
