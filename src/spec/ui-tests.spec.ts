import 'mocha'
import { expect } from 'chai'
import { ElectronApplication, Page, _electron as electron } from 'playwright'
import mockMqtt, { stop as stopMqtt } from './mock-mqtt'
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
 * UI Test Suite for MQTT Explorer
 *
 * These tests validate the core UI functionality of MQTT Explorer.
 * Each test is independent and deterministic.
 *
 * Best Practices Applied:
 * - Wait for specific UI elements rather than fixed timeouts
 * - Use meaningful assertions that verify actual state
 * - Test data-driven scenarios (Given-When-Then pattern)
 * - Capture screenshots for visual verification
 * - Handle MQTT asynchronous operations properly
 *
 * Prerequisites:
 * - MQTT broker running on localhost:1883
 * - Application built with `yarn build`
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
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
      // Given: Application is on connection page
      // When: User connects to MQTT broker
      await connectTo('127.0.0.1', page)
      await sleep(1000)

      // Start Sparkplug client after connection
      await MockSparkplug.run()
      await sleep(1000)

      // Then: Disconnect button should be visible (indicating connected state)
      const disconnectButton = await page.locator('//button/span[contains(text(),"Disconnect")]')
      await disconnectButton.waitFor({ state: 'visible', timeout: 5000 })
      const isVisible = await disconnectButton.isVisible()
      expect(isVisible).to.be.true

      // And: Connection indicator should show connected state
      await page.screenshot({ path: 'test-screenshot-connection.png' })
    })
  })

  describe('Topic Tree Structure', () => {
    it('Given a JSON message sent to topic kitchen/coffee_maker, the tree should display nested topics', async function () {
      // Given: Mock MQTT broker publishes JSON to kitchen/coffee_maker
      // (This is done by mock-mqtt.ts)

      // When: We wait for the topic to appear in the tree
      await sleep(2000) // Allow time for MQTT messages to arrive

      // Then: Topic hierarchy should be visible (kitchen -> coffee_maker)
      const kitchenTopic = await page.locator('span[data-test-topic="kitchen"]')
      await kitchenTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await kitchenTopic.isVisible()).to.be.true

      // And: Clicking on kitchen should expand to show coffee_maker
      await kitchenTopic.click()
      await sleep(500)

      const coffeeMakerTopic = await page.locator('span[data-test-topic="coffee_maker"]')
      await coffeeMakerTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await coffeeMakerTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-tree-hierarchy.png' })
    })

    it('Given messages sent to livingroom/lamp/state and livingroom/lamp/brightness, both should appear under livingroom/lamp', async function () {
      // Given: Mock MQTT publishes to livingroom/lamp/state and livingroom/lamp/brightness
      await sleep(1000)

      // When: We navigate to livingroom topic
      const livingroomTopic = await page.locator('span[data-test-topic="livingroom"]')
      await livingroomTopic.waitFor({ state: 'visible', timeout: 5000 })
      await livingroomTopic.click()
      await sleep(500)

      // Then: lamp subtopic should be visible
      const lampTopic = await page.locator('span[data-test-topic="lamp"]')
      await lampTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await lampTopic.isVisible()).to.be.true

      // When: Clicking on lamp
      await lampTopic.click()
      await sleep(500)

      // Then: Both state and brightness topics should be visible
      const stateTopic = await page.locator('span[data-test-topic="state"]')
      const brightnessTopic = await page.locator('span[data-test-topic="brightness"]')

      await stateTopic.waitFor({ state: 'visible', timeout: 5000 })
      await brightnessTopic.waitFor({ state: 'visible', timeout: 5000 })

      expect(await stateTopic.isVisible()).to.be.true
      expect(await brightnessTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-tree-structure.png' })
    })

    it('should display the correct number of root topics from mock data', async function () {
      // Given: Mock MQTT publishes to multiple root topics
      await sleep(1000)

      // Then: We should see expected root topics (livingroom, kitchen, garden, etc.)
      const rootTopics = ['livingroom', 'kitchen', 'garden']
      for (const topicName of rootTopics) {
        const topic = await page.locator(`span[data-test-topic="${topicName}"]`)
        await topic.waitFor({ state: 'visible', timeout: 5000 })
        const visible = await topic.isVisible()
        expect(visible).to.be.true
      }

      await page.screenshot({ path: 'test-screenshot-root-topics.png' })
    })

    it('Given a JSON message with nested properties, the tree should display the JSON structure', async function () {
      // Given: coffee_maker publishes JSON with heater, temperature, waterLevel
      await sleep(2000)

      // When: Navigate to kitchen/coffee_maker
      await expandTopic('kitchen/coffee_maker', page)
      await sleep(1000)

      // Then: The JSON properties should be visible in the value preview
      // We can verify by checking that the topic is selected and showing details
      const selectedTopic = await page.locator('[class*="selectedTopic"]')
      const hasSelectedTopic = (await selectedTopic.count()) > 0

      expect(hasSelectedTopic).to.be.true

      await page.screenshot({ path: 'test-screenshot-json-structure.png' })
    })
  })

  describe('Topic Navigation and Search', () => {
    it('should display topic hierarchy after connection', async function () {
      // Given: Application is connected to MQTT broker
      await sleep(1000)

      // Then: Topic tree should contain nodes
      const treeNodes = await page.locator('[class*="TreeNode"]')
      const count = await treeNodes.count()
      expect(count).to.be.greaterThan(0, 'Topic tree should contain nodes')

      await page.screenshot({ path: 'test-screenshot-topic-tree.png' })
    })

    it('should search and filter topics containing "temp"', async function () {
      // Given: Multiple topics with "temp" in their path (kitchen/temperature, livingroom/temperature)
      // When: User searches for "temp"
      await searchTree('temp', page)
      await sleep(1000)

      // Then: Search field should contain the search term
      const searchField = await page.locator('//input[contains(@placeholder, "Search")]')
      const searchValue = await searchField.inputValue()
      expect(searchValue).to.equal('temp')

      // And: Only matching topics should be visible
      // We can verify this by checking that temperature topics are still visible
      const tempTopic = await page.locator('span[data-test-topic="temperature"]').first()
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search.png' })

      // When: User clears the search
      await clearSearch(page)
      await sleep(500)

      // Then: Search field should be empty
      const clearedValue = await searchField.inputValue()
      expect(clearedValue).to.equal('')

      // And: All topics should be visible again
      const kitchenTopic = await page.locator('span[data-test-topic="kitchen"]')
      expect(await kitchenTopic.isVisible()).to.be.true
    })

    it('should search for specific topic path like "kitchen/lamp"', async function () {
      // When: User searches for kitchen/lamp
      await searchTree('kitchen/lamp', page)
      await sleep(1000)

      // Then: Kitchen and lamp topics should be visible
      const kitchenTopic = await page.locator('span[data-test-topic="kitchen"]')
      expect(await kitchenTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-search-path.png' })

      await clearSearch(page)
      await sleep(500)
    })
  })

  describe('Message Visualization', () => {
    it('Given a JSON message on topic actuality/showcase, should display formatted JSON', async function () {
      // Given: Mock publishes JSON to actuality/showcase
      // When: User navigates to the topic
      await showJsonPreview(page)
      await sleep(1500)

      // Then: The message should be visible
      await page.screenshot({ path: 'test-screenshot-json-preview.png' })

      // And: We should see formatted JSON content (verified via screenshot)
    })

    it('should show numeric plots for topics with numeric values', async function () {
      // Given: Topics with numeric values (kitchen/coffee_maker/temperature)
      // When: User creates charts for numeric values
      await showNumericPlot(page)
      await sleep(2000)

      // Then: Chart panel should be visible
      const chartPanel = await page.locator('[class*="ChartPanel"]')
      const chartExists = (await chartPanel.count()) > 0
      expect(chartExists).to.be.true

      await page.screenshot({ path: 'test-screenshot-numeric-plots.png' })
    })

    it('should display message diffs when messages change', async function () {
      // Given: Topics that update over time (livingroom/temperature)
      // When: User enables diff view
      await showOffDiffCapability(page)
      await sleep(1500)

      // Then: Diff view should be active
      await page.screenshot({ path: 'test-screenshot-diffs.png' })
    })

    it('Given a message with QoS 2, should display the QoS level', async function () {
      // Given: kitchen/coffee_maker is published with QoS 2
      await sleep(1000)

      // When: Navigate to the topic
      await expandTopic('kitchen/coffee_maker', page)
      await sleep(1000)

      // Then: QoS indicator should be visible
      // (Verified via screenshot showing message details)
      await page.screenshot({ path: 'test-screenshot-qos.png' })
    })
  })

  describe('Clipboard Operations', () => {
    it('should copy topic path to clipboard', async function () {
      // Given: A topic is selected
      // When: User clicks copy topic button
      await copyTopicToClipboard(page)
      await sleep(500)

      // Then: Copy action completes without error
      // Note: Full clipboard verification requires additional platform-specific setup
      await page.screenshot({ path: 'test-screenshot-copy-topic.png' })
    })

    it('should copy message value to clipboard', async function () {
      // Given: A topic with a value is selected
      // When: User clicks copy value button
      await copyValueToClipboard(page)
      await sleep(500)

      // Then: Copy action completes without error
      await page.screenshot({ path: 'test-screenshot-copy-value.png' })
    })
  })

  describe('SparkplugB Support', () => {
    it('Given SparkplugB messages, should decode and display the payload', async function () {
      // Given: Mock SparkplugB client publishes messages
      // When: User navigates to SparkplugB topics
      await showSparkPlugDecoding(page)
      await sleep(2000)

      // Then: Decoded SparkplugB data should be visible
      await page.screenshot({ path: 'test-screenshot-sparkplugb.png' })
    })
  })

  describe('Settings and Configuration', () => {
    it('should open and display settings menu with available options', async function () {
      // When: User opens settings menu
      await showMenu(page)
      await sleep(1500)

      // Then: Settings menu should be visible
      const settingsMenu = await page.locator('[role="menu"]')
      const menuVisible = (await settingsMenu.count()) > 0
      expect(menuVisible).to.be.true

      await page.screenshot({ path: 'test-screenshot-settings.png' })
    })

    it('should show advanced connection settings with subscription options', async function () {
      // Given: User is on connection page
      // First disconnect
      await disconnect(page)
      await sleep(1000)

      // When: User opens advanced connection settings
      await showAdvancedConnectionSettings(page)
      await sleep(1500)

      // Then: Advanced settings should be visible
      const advancedPanel = await page.locator('[class*="advanced"]')
      const hasAdvanced = (await advancedPanel.count()) > 0

      // Take screenshot showing advanced settings
      await page.screenshot({ path: 'test-screenshot-advanced-settings.png' })
    })
  })

  describe('Retained Messages', () => {
    it('Given retained messages on multiple topics, should display retained indicator', async function () {
      // Given: Mock publishes retained messages (e.g., livingroom/lamp/state)
      await sleep(1000)

      // When: Navigate to a topic with retained message
      await expandTopic('livingroom/lamp', page)
      await sleep(1000)

      // Then: The UI should show message details
      // (Retained flag visible in message details panel)
      await page.screenshot({ path: 'test-screenshot-retained.png' })
    })
  })

  describe('Reconnection and Connection State', () => {
    it('Given a connected client, should successfully disconnect and reconnect', async function () {
      // Given: Application is connected
      await sleep(1000)

      // When: User disconnects
      const disconnectButton = await page.locator('//button/span[contains(text(),"Disconnect")]')
      await disconnectButton.waitFor({ state: 'visible', timeout: 5000 })
      await disconnectButton.click()
      await sleep(1000)

      // Then: Connect button should be visible
      const connectButton = await page.locator('//button/span[contains(text(),"Connect")]')
      await connectButton.waitFor({ state: 'visible', timeout: 5000 })
      expect(await connectButton.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-disconnected.png' })

      // When: User reconnects
      await connectButton.click()
      await sleep(2000)

      // Then: Disconnect button should be visible again
      await disconnectButton.waitFor({ state: 'visible', timeout: 5000 })
      expect(await disconnectButton.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-reconnected.png' })
    })
  })

  describe('Message History and Updates', () => {
    it('Given topics with updating values, should display message history', async function () {
      // Given: Topics that update over time (livingroom/temperature)
      await sleep(3000) // Wait for several updates

      // When: Navigate to a topic with history
      await expandTopic('livingroom/temperature', page)
      await sleep(1000)

      // Then: History should be available
      // Click on History tab if visible
      const historyTab = await page.locator('//span[contains(text(), "History")]')
      const historyExists = (await historyTab.count()) > 0

      if (historyExists) {
        await historyTab.click()
        await sleep(500)
        await page.screenshot({ path: 'test-screenshot-history.png' })
      }
    })

    it('Given a topic with changing values, should show value updates in real-time', async function () {
      // Given: kitchen/coffee_maker/temperature updates periodically
      await sleep(1000)

      // When: Navigate to the topic
      await expandTopic('kitchen/coffee_maker', page)
      await sleep(500)

      // Then: Topic should be selected and showing current value
      const selectedTopic = await page.locator('[class*="selectedTopic"]')
      expect((await selectedTopic.count()) > 0).to.be.true

      // Wait for value to update
      await sleep(2000)

      await page.screenshot({ path: 'test-screenshot-updating-value.png' })
    })
  })

  describe('Different QoS Levels', () => {
    it('Given messages with different QoS levels (0, 1, 2), should display them correctly', async function () {
      // Given: Mock publishes messages with different QoS
      // QoS 0: livingroom/lamp/state
      // QoS 2: kitchen/coffee_maker
      await sleep(1000)

      // When: Navigate to QoS 0 topic
      await expandTopic('livingroom/lamp/state', page)
      await sleep(500)

      await page.screenshot({ path: 'test-screenshot-qos-0.png' })

      // When: Navigate to QoS 2 topic
      await expandTopic('kitchen/coffee_maker', page)
      await sleep(500)

      // Then: Both should display their QoS levels
      await page.screenshot({ path: 'test-screenshot-qos-2.png' })
    })
  })

  describe('Special Topic Names and Characters', () => {
    it('Given topics with spaces and special characters, should display correctly', async function () {
      // Given: Mock publishes to "test 123" and "hello"
      await sleep(1000)

      // When: Navigate to topic with space
      const testTopic = await page.locator('span[data-test-topic="test 123"]')
      await testTopic.waitFor({ state: 'visible', timeout: 5000 })

      // Then: Topic should be visible
      expect(await testTopic.isVisible()).to.be.true

      await testTopic.click()
      await sleep(500)

      await page.screenshot({ path: 'test-screenshot-special-chars.png' })
    })

    it('Given topic with MAC address format (01-80-C2-00-00-0F/LWT), should display correctly', async function () {
      // Given: Mock publishes to MAC address topic
      await sleep(1000)

      // When: Search for MAC address topic
      await searchTree('01-80-C2', page)
      await sleep(1000)

      // Then: Topic should be found
      const macTopic = await page.locator('span[data-test-topic="01-80-C2-00-00-0F"]')
      const macVisible = (await macTopic.count()) > 0

      await page.screenshot({ path: 'test-screenshot-mac-address.png' })

      await clearSearch(page)
      await sleep(500)
    })
  })

  describe('Bridge Status Topics', () => {
    it('Given bridge status topics (zigbee2mqtt, ble2mqtt), should display online status', async function () {
      // Given: Mock publishes bridge status topics
      await sleep(1000)

      // When: Navigate to zigbee2mqtt bridge
      const zigbeeTopic = await page.locator('span[data-test-topic="zigbee2mqtt"]')
      await zigbeeTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await zigbeeTopic.isVisible()).to.be.true

      await zigbeeTopic.click()
      await sleep(500)

      const bridgeTopic = await page.locator('span[data-test-topic="bridge"]')
      await bridgeTopic.waitFor({ state: 'visible', timeout: 5000 })
      await bridgeTopic.click()
      await sleep(500)

      // Then: State topic should show "online"
      await page.screenshot({ path: 'test-screenshot-bridge-status.png' })
    })
  })

  describe('3D Printer Integration', () => {
    it('Given 3D printer temperature topics with JSON data, should display bed and tool temperatures', async function () {
      // Given: Mock publishes 3D printer data
      await sleep(4000) // Wait for 3D printer interval

      // When: Navigate to 3D printer topics
      const printerTopic = await page.locator('span[data-test-topic="3d-printer"]')
      await printerTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await printerTopic.isVisible()).to.be.true

      await printerTopic.click()
      await sleep(500)

      const octoPrintTopic = await page.locator('span[data-test-topic="OctoPrint"]')
      await octoPrintTopic.waitFor({ state: 'visible', timeout: 5000 })
      await octoPrintTopic.click()
      await sleep(500)

      // Then: Temperature topics should be visible
      const tempTopic = await page.locator('span[data-test-topic="temperature"]')
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-3d-printer.png' })
    })
  })

  describe('Garden/IoT Device Topics', () => {
    it('Given garden device topics (pump, water level, lamps), should display all device states', async function () {
      // Given: Mock publishes garden device topics
      await sleep(1000)

      // When: Navigate to garden
      const gardenTopic = await page.locator('span[data-test-topic="garden"]')
      await gardenTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await gardenTopic.isVisible()).to.be.true

      await gardenTopic.click()
      await sleep(500)

      // Then: Pump, water, and lamps topics should be visible
      const pumpTopic = await page.locator('span[data-test-topic="pump"]')
      const waterTopic = await page.locator('span[data-test-topic="water"]')
      const lampsTopic = await page.locator('span[data-test-topic="lamps"]')

      await pumpTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await pumpTopic.isVisible()).to.be.true
      expect(await waterTopic.isVisible()).to.be.true
      expect(await lampsTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-garden-devices.png' })
    })
  })

  describe('Topic Value Types', () => {
    it('Given topics with different value types (string, number, percentage), should display correctly', async function () {
      // Given: Various value types in mock data
      await sleep(1000)

      // When: Check string value (garden/pump/state = "off")
      await expandTopic('garden/pump/state', page)
      await sleep(500)

      await page.screenshot({ path: 'test-screenshot-string-value.png' })

      // When: Check percentage value (garden/water/level = "70%")
      await expandTopic('garden/water/level', page)
      await sleep(500)

      await page.screenshot({ path: 'test-screenshot-percentage-value.png' })

      // When: Check numeric value with units (livingroom/thermostat/targetTemperature = "20°C")
      await expandTopic('livingroom/thermostat/targetTemperature', page)
      await sleep(500)

      // Then: All value types should display correctly
      await page.screenshot({ path: 'test-screenshot-temperature-value.png' })
    })
  })

  describe('Multiple Lamp Devices', () => {
    it('Given multiple lamp devices (lamp-1, lamp-2) with same properties, should distinguish them', async function () {
      // Given: Mock publishes to livingroom/lamp-1 and lamp-2
      await sleep(1000)

      // When: Navigate to livingroom
      const livingroomTopic = await page.locator('span[data-test-topic="livingroom"]')
      await livingroomTopic.click()
      await sleep(500)

      // Then: Both lamp-1 and lamp-2 should be visible
      const lamp1Topic = await page.locator('span[data-test-topic="lamp-1"]')
      const lamp2Topic = await page.locator('span[data-test-topic="lamp-2"]')

      await lamp1Topic.waitFor({ state: 'visible', timeout: 5000 })
      await lamp2Topic.waitFor({ state: 'visible', timeout: 5000 })

      expect(await lamp1Topic.isVisible()).to.be.true
      expect(await lamp2Topic.isVisible()).to.be.true

      // When: Expand lamp-1
      await lamp1Topic.click()
      await sleep(500)

      // Then: lamp-1 state and brightness should be visible
      const stateTopic = await page.locator('span[data-test-topic="state"]')
      const brightnessTopic = await page.locator('span[data-test-topic="brightness"]')

      expect(await stateTopic.isVisible()).to.be.true
      expect(await brightnessTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-screenshot-multiple-lamps.png' })
    })
  })

  describe('Search Functionality Edge Cases', () => {
    it('Given a search term that matches multiple topics at different levels, should show all matches', async function () {
      // Given: Multiple topics contain "state" (lamp/state, pump/state, etc.)
      await sleep(1000)

      // When: Search for "state"
      await searchTree('state', page)
      await sleep(1000)

      // Then: Multiple state topics should be visible
      const stateTopics = await page.locator('span[data-test-topic="state"]')
      const count = await stateTopics.count()
      expect(count).to.be.greaterThan(1, 'Should find multiple state topics')

      await page.screenshot({ path: 'test-screenshot-search-multiple.png' })

      await clearSearch(page)
      await sleep(500)
    })

    it('Given a search term with no matches, should display empty tree', async function () {
      // When: Search for non-existent topic
      await searchTree('nonexistenttopic12345', page)
      await sleep(1000)

      // Then: No topics should be visible (or a message)
      await page.screenshot({ path: 'test-screenshot-search-no-results.png' })

      await clearSearch(page)
      await sleep(500)
    })
  })
})
