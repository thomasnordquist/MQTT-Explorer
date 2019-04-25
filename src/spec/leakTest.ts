import * as fs from 'fs'
import * as os from 'os'
import * as webdriverio from 'webdriverio'
import mockMqtt, { stopUpdates as stopMqttUpdates } from './mock-mqtt'
import {
  ClassNameMapping,
  countInstancesOf,
  createFakeMousePointer,
  getHeapDump,
  setFast,
  sleep
  } from './util'
import { clearSearch, searchTree } from './scenarios/searchTree'
import { connectTo } from './scenarios/connect'
import { reconnect } from './scenarios/reconnect'

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
  console.log('Waiting for MQTT Broker on port 1880 (no auth)')
  await mockMqtt()
  console.log('start webdriver')

  const browser = await webdriverio.remote(options)
  setFast()
  await createFakeMousePointer(browser)

  // Wait for Username input to be visible
  await browser.$('//label[contains(text(), "Username")]/..//input')
  await connectTo('127.0.0.1', browser)
  stopMqttUpdates()
  await sleep(1000, true)

  let heapDump = await getHeapDump(browser)
  const initialTreeOccurrances = await countInstancesOf(heapDump, ClassNameMapping.Tree)
  const initialNodeOccurrances = await countInstancesOf(heapDump, ClassNameMapping.TreeNode)
  console.log(initialTreeOccurrances, initialNodeOccurrances)

  await doX(3, async () => {
    await reconnect(browser)
  })

  await sleep(1000, true)

  await doX(15, async () => {
    await searchTree('temp', browser)
    await reconnect(browser)
  })

  await searchTree('ab', browser)
  await clearSearch(browser)

  await searchTree('temp', browser)
  await clearSearch(browser)

  await sleep(1000, true)

  await waitForGarbageCollectorToDetermineLeak(browser, initialTreeOccurrances, initialNodeOccurrances)
}

async function waitForGarbageCollectorToDetermineLeak(browser: any, initialTreeOccurrances: number, initialNodeOccurrances: number) {
  let delta = -1
  let lastTreeOccurances = -1
  let lastNodeOccurances = -1
  let leak = false
  while (delta < 0) {
    if (lastTreeOccurances !== -1) {
      await sleep(120000, true)
    }
    const heapDump = await getHeapDump(browser)
    const currentTreeOccurrances = await countInstancesOf(heapDump, ClassNameMapping.Tree)
    const currentNodeOccurrances = await countInstancesOf(heapDump, ClassNameMapping.TreeNode)
    if (initialTreeOccurrances !== currentTreeOccurrances || Math.abs(currentNodeOccurrances - initialNodeOccurrances) > 8) {
      console.error('Possible leak detected', initialTreeOccurrances, currentTreeOccurrances, initialNodeOccurrances, currentNodeOccurrances)
      leak = true
    } else {
      leak = false
    }

    const treeDelta = lastTreeOccurances >= 0 ? currentTreeOccurrances - lastTreeOccurances : -1
    const nodeDelta = lastTreeOccurances >= 0 ? currentNodeOccurrances - lastNodeOccurances : -1
    delta = treeDelta + nodeDelta

    lastTreeOccurances = currentTreeOccurrances
    lastNodeOccurances = currentNodeOccurrances
  }

  if (leak) {
    console.error('leak')
    process.exit(100)
  }
}

async function doX(x: number, action: () => Promise<any>) {
  for (let i = 0; i < x; i += 1) {
    await action()
    await sleep(10, true)
  }
}

doStuff()
