import * as webdriverio from 'webdriverio'
import * as os from 'os'
import mockMqtt, { stop } from './mock-mqtt'
import { connectTo } from './scenarios/connect'
import { showNumericPlot } from './scenarios/showNumericPlot'
import { showJsonPreview } from './scenarios/showJsonPreview'
import { copyTopicToClipboard } from './scenarios/copyTopicToClipboard'
import { copyValueToClipboard } from './scenarios/copyValueToClipboard'
import { clearOldTopics } from './scenarios/clearOldTopics'
import { showMenu } from './scenarios/showMenu'

import { createFakeMousePointer, sleep, showText, hideText } from './util'

const binary = os.platform() === 'darwin' ? 'Electron.app/Contents/MacOS/Electron' : 'electron'
const options = {
  host: 'localhost', // Use localhost as chrome driver server
  port: 9515, // "9515" is the port opened by chrome driver.
  capabilities: {
    browserName: 'electron',
    chromeOptions: {
      binary: `${__dirname}/../../../node_modules/electron/dist/${binary}`,
      args: [`--app=${__dirname}/../../..`, '--force-device-scale-factor=1', '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions'],
    },
    windowTypes: ['app', 'webview'],
  },
}

async function doStuff() {
  await mockMqtt()
  const browser = await webdriverio.remote(options)
  await createFakeMousePointer(browser)

  await connectTo('localhost', browser)
  await sleep(2000) // Allow some topics to pour in
  await showText('Plotting topics', 0, browser)
  await showNumericPlot(browser)
  await sleep(2000)
  await hideText(browser)
  await showText('JSON preview', 0, browser)
  await showJsonPreview(browser)
  await sleep(2000)
  await hideText(browser)
  await showText('Copy&Paste data', 2000, browser)
  await copyTopicToClipboard(browser)
  await sleep(1000)
  await hideText(browser)
  await copyValueToClipboard(browser)
  await sleep(1000)
  await hideText(browser)
  await showText('Delete retained topics', 0, browser)
  await clearOldTopics(browser)
  await hideText(browser)
  await showText('Settings', 3000, browser)
  await showMenu(browser)
  browser.closeWindow()

  stop()
}

doStuff()
