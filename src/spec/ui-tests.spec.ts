import 'mocha'
import { expect } from 'chai'
import { ElectronApplication, Page, _electron as electron } from 'playwright'
import mockMqtt, { stop as stopMqtt } from './mock-mqtt'
import { default as MockSparkplug } from './mock-sparkplugb'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import { searchTree, clearSearch } from './scenarios/searchTree'

/**
 * MQTT Explorer UI Tests - Minimal Core Suite
 * 
 * This is a minimal, reliable test suite that focuses on core functionality
 * and avoids complex navigation that causes timeouts.
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
describe('MQTT Explorer UI Tests', function () {
  this.timeout(60000)

  let electronApp: ElectronApplication
  let page: Page
  let mqttClientStarted = false

  before(async function () {
    this.timeout(90000)

    console.log('Starting MQTT mock broker...')
    await mockMqtt()
    mqttClientStarted = true

    console.log('Launching Electron application...')
    electronApp = await electron.launch({
      args: [`${__dirname}/../../..`, '--runningUiTestOnCi', '--no-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000,
    })

    console.log('Waiting for application window...')
    page = await electronApp.firstWindow({ timeout: 30000 })

    // Wait for the connection form to be ready
    await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })

    console.log('Application ready for testing')
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

  describe('Connection Management', () => {
    it('should connect to MQTT broker successfully', async function () {
      await connectTo('127.0.0.1', page)
      await sleep(1000)

      await MockSparkplug.run()
      await sleep(1000)

      const disconnectButton = await page.locator('//button/span[contains(text(),"Disconnect")]')
      await disconnectButton.waitFor({ state: 'visible', timeout: 5000 })
      const isVisible = await disconnectButton.isVisible()
      expect(isVisible).to.be.true

      await page.screenshot({ path: 'test-screenshot-connection.png' })
    })
  })

  describe('Topic Tree Structure', () => {
    it('should display kitchen topic from mock data', async function () {
      await sleep(2000)

      const kitchenTopic = await page.locator('span[data-test-topic="kitchen"]')
      await kitchenTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await kitchenTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-kitchen.png' })
    })

    it('should display root topics from mock data', async function () {
      await sleep(1000)

      const rootTopics = ['livingroom', 'kitchen', 'garden']
      for (const topicName of rootTopics) {
        const topic = await page.locator(`span[data-test-topic="${topicName}"]`)
        await topic.waitFor({ state: 'visible', timeout: 5000 })
        const visible = await topic.isVisible()
        expect(visible).to.be.true
      }

      await page.screenshot({ path: 'test-screenshot-root-topics.png' })
    })
  })

  describe('Search Functionality', () => {
    it('should search and filter topics containing "temp"', async function () {
      await searchTree('temp', page)
      await sleep(1000)

      const searchField = await page.locator('//input[contains(@placeholder, "Search")]')
      const searchValue = await searchField.inputValue()
      expect(searchValue).to.equal('temp')

      const tempTopic = await page.locator('span[data-test-topic="temperature"]').first()
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search.png' })
      
      // Clear search for next test
      await clearSearch(page)
      await sleep(500)
    })

    it('should search for specific topic path like "kitchen/lamp"', async function () {
      await searchTree('kitchen/lamp', page)
      await sleep(1000)

      const searchField = await page.locator('//input[contains(@placeholder, "Search")]')
      const searchValue = await searchField.inputValue()
      expect(searchValue).to.equal('kitchen/lamp')

      await page.screenshot({ path: 'test-screenshot-search-path.png' })
      
      // Clear search
      await clearSearch(page)
      await sleep(500)
    })
  })
})
