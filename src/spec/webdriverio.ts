import * as os from 'os'
import * as webdriverio from 'webdriverio'
import mockMqtt, { stop } from './mock-mqtt'
import { clearOldTopics } from './scenarios/clearOldTopics'
import { clearSearch, searchTree } from './scenarios/searchTree'
import { connectTo } from './scenarios/connect'
import { copyTopicToClipboard } from './scenarios/copyTopicToClipboard'
import { copyValueToClipboard } from './scenarios/copyValueToClipboard'
import { disconnect } from './scenarios/disconnect'
import { publishTopic } from './scenarios/publishTopic'
import { showJsonFormatting } from './scenarios/showJsonFormatting'
import { showJsonPreview } from './scenarios/showJsonPreview'
import { showMenu } from './scenarios/showMenu'
import { showNumericPlot } from './scenarios/showNumericPlot'
import { showOffDiffCapability } from './scenarios/showOffDiffCapability'
import { showZoomLevel } from './scenarios/showZoomLevel'
import { showAdvancedConnectionSettings } from './scenarios/showAdvancedConnectionSettings'
import {
  clickOnHistory,
  createFakeMousePointer,
  hideText,
  showText,
  sleep,
} from './util'

process.on('unhandledRejection', (error: Error) => {
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
      args: [`--app=${__dirname}/../../..`, '--force-device-scale-factor=1', '--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions'].concat(runningUiTestOnCi),
    },
    windowTypes: ['app', 'webview'],
  },
}

async function doStuff() {
  console.log('mock mqtt')
  await mockMqtt()
  console.log('start webdriver')

  const browser = await webdriverio.remote(options)
  await createFakeMousePointer(browser)

  await connectTo('127.0.0.1', browser)

  await sleep(1000)

  await sleep(1000)
  await showText('Topics overview', 2000, browser, 'top')
  await sleep(2000)
  await showText('Indicate topic updates', 2000, browser, 'bottom')
  await sleep(3000)

  await showText('Plot topic history', 2000, browser)
  await showNumericPlot(browser)
  await sleep(2000)

  await showJsonPreview(browser)
  await showText('Formatted messages', 1500, browser, 'top')
  await sleep(1500)

  await showOffDiffCapability(browser)
  await hideText(browser)

  await showText('Publish topics', 2000, browser, 'top')
  await clickOnHistory(browser)
  await publishTopic(browser)
  await sleep(1000)

  await showText('Write JSON with ease', 2000, browser, 'top')
  await showJsonFormatting(browser)
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

  await showText('Customize Subscriptions', 3000, browser, 'top')
  await showAdvancedConnectionSettings(browser)

  await showText('Keyboard shortcuts', 1750, browser, 'middle')
  await sleep(1750)
  await showZoomLevel(browser)

  await showText('The End', 3000, browser, 'middle')
  await sleep(3000)

  browser.closeWindow()
  stop()
}

doStuff()
