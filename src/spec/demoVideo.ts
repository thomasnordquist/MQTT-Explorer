import * as fs from 'fs'
import * as os from 'os'
import * as webdriverio from 'webdriverio'
import mockMqtt, { stop as stopMqtt } from './mock-mqtt'
import { clearOldTopics } from './scenarios/clearOldTopics'
import { clearSearch, searchTree } from './scenarios/searchTree'
import { clickOnHistory, createFakeMousePointer, hideText, showText, sleep } from './util'
import { connectTo } from './scenarios/connect'
import { copyTopicToClipboard } from './scenarios/copyTopicToClipboard'
import { copyValueToClipboard } from './scenarios/copyValueToClipboard'
import { disconnect } from './scenarios/disconnect'
import { publishTopic } from './scenarios/publishTopic'
import { SceneBuilder } from './SceneBuilder'
import { showAdvancedConnectionSettings } from './scenarios/showAdvancedConnectionSettings'
import { showJsonPreview } from './scenarios/showJsonPreview'
import { showMenu } from './scenarios/showMenu'
import { showNumericPlot } from './scenarios/showNumericPlot'
import { showOffDiffCapability } from './scenarios/showOffDiffCapability'
import { showZoomLevel } from './scenarios/showZoomLevel'

process.on('unhandledRejection', (error: Error | any) => {
  console.error('unhandledRejection', error.message, error.stack)
  process.exit(1)
})

const runningUiTestOnCi = os.platform() === 'darwin' ? [] : ['--runningUiTestOnCi']

console.log(`${__dirname}/../../../node_modules/.bin/electron`)
const options = {
  host: '127.0.0.1', // Use localhost as chrome driver server
  port: 9515, // "9515" is the port opened by chrome driver.
  capabilities: {
    browserName: 'electron',
    chromeOptions: {
      binary: `${__dirname}/../../../node_modules/.bin/electron`,
      args: [
        `--app=${__dirname}/../../..`,
        '--force-device-scale-factor=1',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
      ].concat(runningUiTestOnCi),
    },
    windowTypes: ['app', 'webview'],
  },
}

async function doStuff() {
  console.log('Waiting for MQTT Broker on port 1880 (no auth)')
  await mockMqtt()
  console.log('start webdriver')

  const browser = await webdriverio.remote(options)
  await createFakeMousePointer(browser)

  // Wait for Username input to be visible
  await browser.$('//label[contains(text(), "Username")]/..//input')
  const scenes = new SceneBuilder()
  await scenes.record('connect', async () => {
    await connectTo('127.0.0.1', browser)
    await sleep(1000)
  })

  await scenes.record('numeric_plots', async () => {
    await showText('Plot topic history', 1500, browser)
    await showNumericPlot(browser)
    await sleep(2000)
  })

  await scenes.record('json-formatting', async () => {
    await showJsonPreview(browser)
    await showText('Formatted messages', 1500, browser, 'top')
    await sleep(1500)
  })

  await scenes.record('diffs', async () => {
    await showOffDiffCapability(browser)
    await hideText(browser)
  })

  await scenes.record('publish_topic', async () => {
    await showText('Publish topics', 1500, browser, 'top')
    await clickOnHistory(browser)
    await publishTopic(browser)
    await sleep(1000)
  })

  await scenes.record('clipboard', async () => {
    await showText('Copy to Clipboard', 1500, browser)
    await copyTopicToClipboard(browser)
    await hideText(browser)
    await copyValueToClipboard(browser)
    await sleep(1000)
  })

  await scenes.record('topic_filter', async () => {
    await showText('Search topic hierarchy', 0, browser, 'middle')
    await searchTree('temp', browser)
    await hideText(browser)
    await showText('Topics containing "temp"', 1500, browser)
    await sleep(1500)
    await clearSearch(browser)
    await sleep(1000)
  })

  await scenes.record('delete_retained_topics', async () => {
    await hideText(browser)
    await showText('Delete retained topics', 5000, browser)
    await clearOldTopics(browser)
    await hideText(browser)
  })

  await scenes.record('settings', async () => {
    await showText('Settings', 1500, browser)
    await showMenu(browser)
  })

  await scenes.record('customize_subscriptions', async () => {
    await sleep(2000)
    await disconnect(browser)
    await showText('Customize Subscriptions', 1500, browser, 'top')
    await showAdvancedConnectionSettings(browser)
  })

  await scenes.record('keyboard_shortcuts', async () => {
    await showText('Keyboard shortcuts', 1500, browser, 'middle')
    await sleep(1750)
    await showZoomLevel(browser)
  })

  await scenes.record('end', async () => {
    await showText('The End', 3000, browser, 'middle')
    await sleep(3000)
  })

  browser.closeWindow()
  stopMqtt()

  fs.writeFileSync('scenes.json', JSON.stringify(scenes.scenes, undefined, '  '))
}

doStuff()
