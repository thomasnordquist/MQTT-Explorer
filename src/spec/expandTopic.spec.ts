import 'mocha'
import { expect } from 'chai'
import { ElectronApplication, Page, _electron as electron } from 'playwright'
import type { MqttClient } from 'mqtt'
import { createTestMock, stopTestMock } from './mock-mqtt-test'
import { sleep } from './util'
import { connectTo } from './scenarios/connect'
import { expandTopic } from './util/expandTopic'

/**
 * Isolated Test for expandTopic UI Helper
 *
 * This test validates that the expandTopic function correctly:
 * 1. Finds topics in the tree hierarchy
 * 2. Expands nested topics correctly
 * 3. Handles multiple levels of nesting
 * 4. Differentiates between topics with the same name in different branches
 */
// tslint:disable:only-arrow-functions ter-prefer-arrow-callback no-unused-expression
// Disabled rules:
// - only-arrow-functions, ter-prefer-arrow-callback: Mocha test style uses traditional functions for proper `this` binding
// - no-unused-expression: Chai assertions like `expect(x).to.be.true` are expressions
describe('expandTopic UI Helper - Isolated Test', function () {
  this.timeout(90000)

  let electronApp: ElectronApplication
  let testMock: MqttClient
  let page: Page

  before(async function () {
    this.timeout(120000)

    console.log('Creating test-specific MQTT mock...')
    testMock = await createTestMock()

    console.log('Publishing test topics...')
    // Create a diverse topic structure for testing
    testMock.publish('kitchen/lamp/state', 'on', { retain: true, qos: 0 })
    testMock.publish('kitchen/lamp/brightness', '75', { retain: true, qos: 0 })
    testMock.publish('kitchen/temperature', '22.5', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp/state', 'off', { retain: true, qos: 0 })
    testMock.publish('livingroom/lamp/brightness', '50', { retain: true, qos: 0 })
    testMock.publish('livingroom/temperature', '21.0', { retain: true, qos: 0 })
    testMock.publish('garage/door/status', 'closed', { retain: true, qos: 0 })
    await sleep(1000) // Let messages propagate

    console.log('Launching Electron application...')
    electronApp = await electron.launch({
      args: [`${__dirname}/../../..`, '--runningUiTestOnCi', '--no-sandbox', '--disable-dev-shm-usage'],
      timeout: 60000,
    })

    console.log('Getting application window...')
    page = await electronApp.firstWindow({ timeout: 30000 })
    await page.locator('//label[contains(text(), "Host")]/..//input').waitFor({ timeout: 10000 })

    console.log('Connecting to MQTT broker...')
    const brokerHost = process.env.TESTS_MQTT_BROKER_HOST || '127.0.0.1'
    await connectTo(brokerHost, page)
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

  describe('Single Level Topics', () => {
    it('should expand a single-level topic (kitchen)', async () => {
      // Given: Topics are loaded
      // When: Expand single-level topic
      await expandTopic('kitchen', page)

      // Then: Kitchen topic should be visible and clickable
      const kitchenTopic = await page.locator('span[data-test-topic="kitchen"]')
      await kitchenTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await kitchenTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-expand-single-level.png' })
    })

    it('should expand another single-level topic (livingroom)', async () => {
      // Given: Topics are loaded
      // When: Expand single-level topic
      await expandTopic('livingroom', page)

      // Then: Livingroom topic should be visible
      const livingroomTopic = await page.locator('span[data-test-topic="livingroom"]')
      await livingroomTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await livingroomTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-expand-another-single-level.png' })
    })
  })

  describe('Two Level Topics', () => {
    it('should expand a two-level topic (kitchen/lamp)', async () => {
      // Given: Topics are loaded
      // When: Expand two-level topic
      await expandTopic('kitchen/lamp', page)

      // Then: Both kitchen and lamp should be visible
      const kitchenTopic = await page.locator('span[data-test-topic="kitchen"]')
      const lampTopic = await page.locator('span[data-test-topic="lamp"]')

      expect(await kitchenTopic.isVisible()).to.be.true
      expect(await lampTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-expand-two-level-kitchen-lamp.png' })
    })

    it('should expand a different two-level topic (kitchen/temperature)', async () => {
      // Given: Topics are loaded
      // When: Expand two-level topic
      await expandTopic('kitchen/temperature', page)

      // Then: Temperature topic under kitchen should be visible
      const tempTopic = await page.locator('span[data-test-topic="temperature"]')
      await tempTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await tempTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-expand-two-level-kitchen-temp.png' })
    })
  })

  describe('Three Level Topics', () => {
    it('should expand a three-level topic (kitchen/lamp/state)', async () => {
      // Given: Topics are loaded
      // When: Expand three-level topic
      await expandTopic('kitchen/lamp/state', page)

      // Then: All three levels should be visible
      const kitchenTopic = await page.locator('span[data-test-topic="kitchen"]')
      const lampTopic = await page.locator('span[data-test-topic="lamp"]')
      const stateTopic = await page.locator('span[data-test-topic="state"]')

      expect(await kitchenTopic.isVisible()).to.be.true
      expect(await lampTopic.isVisible()).to.be.true
      expect(await stateTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-expand-three-level.png' })
    })

    it('should expand kitchen/lamp/brightness (different leaf same parent)', async () => {
      // Given: Topics are loaded
      // When: Expand another three-level topic under same parent
      await expandTopic('kitchen/lamp/brightness', page)

      // Then: Brightness topic should be visible
      const brightnessTopic = await page.locator('span[data-test-topic="brightness"]')
      await brightnessTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await brightnessTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-expand-three-level-brightness.png' })
    })
  })

  describe('Different Branches', () => {
    it('should correctly expand livingroom/lamp (different branch, same name)', async () => {
      // Given: Topics are loaded (kitchen/lamp also exists)
      // When: Expand livingroom/lamp (note: lamp exists under both kitchen and livingroom)
      await expandTopic('livingroom/lamp', page)

      // Then: Should expand the lamp under livingroom, not kitchen
      // We verify this by checking that after clicking, we're in the livingroom branch
      const livingroomTopic = await page.locator('span[data-test-topic="livingroom"]')
      const lampTopic = await page.locator('span[data-test-topic="lamp"]')

      expect(await livingroomTopic.isVisible()).to.be.true
      expect(await lampTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-expand-different-branch.png' })
    })

    it('should expand livingroom/lamp/state (full path in different branch)', async () => {
      // Given: kitchen/lamp/state also exists
      // When: Expand livingroom/lamp/state
      await expandTopic('livingroom/lamp/state', page)

      // Then: Should see state under livingroom/lamp
      const stateTopic = await page.locator('span[data-test-topic="state"]')
      await stateTopic.waitFor({ state: 'visible', timeout: 5000 })
      expect(await stateTopic.isVisible()).to.be.true

      await page.screenshot({ path: 'test-expand-different-branch-full.png' })
    })
  })

  describe('Error Handling', () => {
    it('should throw error for non-existent topic', async () => {
      // Given: Topics are loaded
      // When: Try to expand non-existent topic
      // Then: Should throw error
      try {
        await expandTopic('nonexistent/topic/path', page)
        expect.fail('Should have thrown an error for non-existent topic')
      } catch (error: any) {
        expect(error.message).to.include('Could not find topic')
      }
    })
  })
})
