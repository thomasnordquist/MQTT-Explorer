import * as os from 'os'
import { ElectronApplication, _electron as electron } from 'playwright'

import mockMqtt, { stopUpdates as stopMqttUpdates } from './mock-mqtt'
import { ClassNameMapping, countInstancesOf, createFakeMousePointer, getHeapDump, setFast, sleep } from './util'
import { clearSearch, searchTree } from './scenarios/searchTree'
import { connectTo } from './scenarios/connect'
import { reconnect } from './scenarios/reconnect'

process.on('unhandledRejection' as any, (error: Error | any) => {
  console.error('unhandledRejection', error.message, error.stack)
  process.exit(1)
})

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
  const browser = await electronApp.firstWindow({ timeout: 3000 })
  // Print the title.
  console.log(await browser.title())
  // Capture a screenshot.
  await browser.screenshot({ path: 'intro.png' })
  // Direct Electron console to Node terminal.
  browser.on('console', console.log)

  setFast()
  await createFakeMousePointer(browser)
  // Wait for Username input to be visible
  await browser.locator('//label[contains(text(), "Username")]/..//input')
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
