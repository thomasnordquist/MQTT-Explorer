import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { ElectronApplication, _electron as electron } from 'playwright'

import mockMqtt, { stop as stopMqtt } from './mock-mqtt'
import { default as MockSparkplug } from './mock-sparkplugb'
import { clearOldTopics } from './scenarios/clearOldTopics'
import { clearSearch, searchTree } from './scenarios/searchTree'
import { clickOnHistory, createFakeMousePointer, hideText, showText, sleep } from './util'
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
import { showZoomLevel } from './scenarios/showZoomLevel'
import { showSparkPlugDecoding } from './scenarios/showSparkplugDecoding'

/**
 *  A convenience method that handles gracefully cleaning up the test run.
 */
const cleanUp = async (scenes: SceneBuilder, electronApp: ElectronApplication) => {
  // Exit app.
  fs.writeFileSync('scenes.json', JSON.stringify(scenes.scenes, undefined, '  '))
  await electronApp.close()
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

const runningUiTestOnCi = os.platform() === 'darwin' ? [] : ['--runningUiTestOnCi']

async function doStuff() {
  console.log('Waiting for MQTT Broker on port 1880 (no auth)')
  await mockMqtt()

  console.log('Starting playwright/electron')

  // Launch Electron app.
  const electronApp: ElectronApplication = await electron.launch({
    args: [`${__dirname}/../../..`, ...runningUiTestOnCi],
  })

  console.log('Playwright started')
  // Get the first window that the app opens, wait if necessary.
  const page = await electronApp.firstWindow({ timeout: 3000 })
  // Print the title.
  console.log(await page.title())
  // Capture a screenshot.
  await page.screenshot({ path: 'intro.png' })
  // Direct Electron console to Node terminal.
  page.on('console', console.log)

  // Wait for Username input to be visible
  await page.locator('//label[contains(text(), "Username")]/..//input')

  const scenes = new SceneBuilder()
  await scenes.record('connect', async () => {
    await connectTo('127.0.0.1', page)
    await MockSparkplug.run() // Start sparkplug client after connect or birth topics will be missed
    await sleep(1000)
  })

  await scenes.record('numeric_plots', async () => {
    await showText('Plot topic history', 1500, page)
    await showNumericPlot(page)
    await sleep(2000)
  })

  await scenes.record('json-formatting', async () => {
    await showJsonPreview(page)
    await showText('Formatted messages', 1500, page, 'top')
    await sleep(1500)
  })

  await scenes.record('diffs', async () => {
    await showOffDiffCapability(page)
    await hideText(page)
  })

  // disable this scenario for now until expandTopic is sorted out
  // await scenes.record('publish_topic', async () => {
  //   await showText('Publish topics', 1500, page, 'top')
  //   await clickOnHistory(page)
  //   await publishTopic(page)
  //   await sleep(1000)
  // })

  await scenes.record('clipboard', async () => {
    await showText('Copy to Clipboard', 1500, page)
    await copyTopicToClipboard(page)
    await hideText(page)
    await copyValueToClipboard(page)
    await sleep(1000)
  })

  await scenes.record('topic_filter', async () => {
    await showText('Search topic hierarchy', 0, page, 'middle')
    await searchTree('temp', page)
    await hideText(page)
    await showText('Topics containing "temp"', 1500, page)
    await sleep(1500)
    await clearSearch(page)
    await sleep(1000)
  })

  await scenes.record('sparkplugb-decoding', async () => {
    await showText('SparkplugB Decoding', 2000, page, 'top')
    await showSparkPlugDecoding(page)
  })

  // disable this scenario for now until expandTopic is sorted out
  // await scenes.record('delete_retained_topics', async () => {
  //   await hideText(page)
  //   await showText('Delete retained topics', 5000, page)
  //   await clearOldTopics(page)
  //   await hideText(page)
  // })

  await scenes.record('settings', async () => {
    await showText('Settings', 1500, page)
    await showMenu(page)
  })

  await scenes.record('customize_subscriptions', async () => {
    await sleep(2000)
    await disconnect(page)
    await showText('Customize Subscriptions', 1500, page, 'top')
    await showAdvancedConnectionSettings(page)
  })

  await scenes.record('keyboard_shortcuts', async () => {
    await showText('Keyboard shortcuts', 1500, page, 'middle')
    await sleep(1750)
    await showZoomLevel(page)
  })

  await scenes.record('end', async () => {
    await showText('The End', 3000, page, 'middle')
    await sleep(3000)
  })

  setTimeout(() => {
    console.log('Forced quit')
    process.exit(0)
  }, 10 * 1000)
  stopMqtt()
  console.log('Stopped mqtt client')

  cleanUp(scenes, electronApp)

  // Force exit since there appear to be open handles
  process.exit(0)
}

doStuff()
