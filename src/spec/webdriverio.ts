process.on('unhandledRejection', (error: Error) => {
  console.error('unhandledRejection', error.message, error.stack)
  process.exit(1)
})

import * as webdriverio from 'webdriverio'
import * as os from 'os'
import mockMqtt, { stop } from './mock-mqtt'
import { connectTo } from './scenarios/connect'
import { disconnect } from './scenarios/disconnect'
import { showNumericPlot } from './scenarios/showNumericPlot'
import { showJsonPreview } from './scenarios/showJsonPreview'
import { compareJsonSideBySide } from './scenarios/compareJsonSideBySide'
import { searchTree, clearSearch } from './scenarios/searchTree'
import { copyTopicToClipboard } from './scenarios/copyTopicToClipboard'
import { copyValueToClipboard } from './scenarios/copyValueToClipboard'
import { publishTopic } from './scenarios/publishTopic'
import { clearOldTopics } from './scenarios/clearOldTopics'
import { showMenu } from './scenarios/showMenu'

import { createFakeMousePointer, sleep, showText, hideText, clickOnHistory } from './util'

const binary = os.platform() === 'darwin' ? 'Electron.app/Contents/MacOS/Electron' : 'electron'
const runningUiTestOnCi = os.platform() === 'darwin' ? [] : ['--runningUiTestOnCi']

const options = {
  host: 'localhost', // Use localhost as chrome driver server
  port: 9515, // "9515" is the port opened by chrome driver.
  capabilities: {
    browserName: 'electron',
    chromeOptions: {
      binary: `${__dirname}/../../../node_modules/electron/dist/${binary}`,
      args: [`--app=${__dirname}/../../..`, '--force-device-scale-factor=1', '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions'].concat(runningUiTestOnCi),
    },
    windowTypes: ['app', 'webview'],
  },
}

async function doStuff() {
  await mockMqtt()
  const browser = await webdriverio.remote(options)
  await createFakeMousePointer(browser)

  await connectTo('127.0.0.1', browser)
  await sleep(1000)

  await sleep(1000)
  await showText('Overview of topics', 2000, browser, 'top')
  await sleep(2000)
  await showText('Indicates which topics change', 2000, browser, 'bottom')
  await sleep(3000)

  await showText('Plot topics', 2000, browser)
  await showNumericPlot(browser)
  await sleep(2000)

  await showText('Formatted messages', 2000, browser, 'top')
  await showJsonPreview(browser)
  await sleep(2000)

  await showText('Compare messages', 2000, browser, 'top')
  await compareJsonSideBySide(browser)
  await hideText(browser)

  await showText('Publish topics', 2000, browser, 'top')
  await clickOnHistory(browser)
  await publishTopic(browser)
  await sleep(1000)

  await showText('Copy to Clipboard', 2000, browser)
  await copyTopicToClipboard(browser)
  await hideText(browser)
  await copyValueToClipboard(browser)
  await sleep(1000)

  await showText('Search topic hierarchy', 0, browser, 'middle')
  await searchTree('temp', browser)
  await hideText(browser)
  await showText('Topics containing "temp"', 1500, browser)
  await sleep(1500)
  await clearSearch(browser)
  await sleep(1000)

  await hideText(browser)
  await showText('Delete retained topics', 0, browser)
  await clearOldTopics(browser)
  await hideText(browser)

  await showText('Display Options', 2000, browser)
  await showMenu(browser)

  await sleep(2000)
  await disconnect(browser)
  await sleep(3000)

  browser.closeWindow()

  stop()
}

doStuff()
