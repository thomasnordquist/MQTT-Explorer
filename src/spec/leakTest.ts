import * as os from 'os'
import mockMqtt, { stopUpdates as stopMqttUpdates } from './mock-mqtt'
import { ClassNameMapping, countInstancesOf, createFakeMousePointer, getHeapDump, setFast, sleep } from './util'
import { clearSearch, searchTree } from './scenarios/searchTree'
import { connectTo } from './scenarios/connect'
import { reconnect } from './scenarios/reconnect'

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

  const browser = await WebdriverIO.remote(options)
  setFast()
  await createFakeMousePointer(browser)

  // Wait for Username input to be visible
  await browser.$('//label[contains(text(), "Username")]/..//input')
  await connectTo('127.0.0.1', browser)
  stopMqttUpdates()
  await sleep(1000, true)

  const heapDump = await getHeapDump(browser)
  const initialTreeOccurrences = await countInstancesOf(heapDump, ClassNameMapping.Tree)
  const initialNodeOccurrences = await countInstancesOf(heapDump, ClassNameMapping.TreeNode)
  console.log(initialTreeOccurrences, initialNodeOccurrences)

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

  await waitForGarbageCollectorToDetermineLeak(browser, initialTreeOccurrences, initialNodeOccurrences)
}

async function waitForGarbageCollectorToDetermineLeak(
  browser: any,
  initialTreeOccurrences: number,
  initialNodeOccurrences: number
) {
  let delta = -1
  let lastTreeOccurrences = -1
  let lastNodeOccurrences = -1
  let leak = false
  while (delta < 0) {
    if (lastTreeOccurrences !== -1) {
      await sleep(10000, true)
    }
    const heapDump = await getHeapDump(browser)
    const currentTreeOccurrences = await countInstancesOf(heapDump, ClassNameMapping.Tree)
    const currentNodeOccurrences = await countInstancesOf(heapDump, ClassNameMapping.TreeNode)

    // Temporary "leaks" are expected due to React Fibers memoization
    if (
      Math.abs(initialTreeOccurrences - currentTreeOccurrences) > 1 ||
      Math.abs(currentNodeOccurrences - initialNodeOccurrences) > 8
    ) {
      console.error(
        'Possible leak detected',
        initialTreeOccurrences,
        currentTreeOccurrences,
        initialNodeOccurrences,
        currentNodeOccurrences
      )
      leak = true
    } else {
      leak = false
    }

    const treeDelta = lastTreeOccurrences >= 0 ? currentTreeOccurrences - lastTreeOccurrences : -1
    const nodeDelta = lastTreeOccurrences >= 0 ? currentNodeOccurrences - lastNodeOccurrences : -1
    delta = treeDelta + nodeDelta

    lastTreeOccurrences = currentTreeOccurrences
    lastNodeOccurrences = currentNodeOccurrences
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
