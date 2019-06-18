import * as fs from 'fs'
import { Browser, Element } from 'webdriverio'

export { expandTopic } from './expandTopic'

let fast = false
export function setFast() {
  fast = true
}

export function sleep(ms: number, required = false) {
  return new Promise(resolve => {
    if (required) {
      setTimeout(resolve, ms)
    } else {
      setTimeout(resolve, fast ? 0 : ms)
    }
  })
}

export async function writeText(text: string, browser: Browser, delay = 0) {
  if (fast) {
    return browser.keys(text.split(''))
  }

  for (const c of text.split('')) {
    await browser.keys([c])
    await sleep(delay)
  }
}

export async function deleteTextWithBackspaces(element: Element, browser: Browser, delay = 0, count = 0) {
  const length = count > 0 ? count : (await element.getValue()).length
  for (let i = 0; i < length; i += 1) {
    await browser.keys(['Backspace'])
    await sleep(delay)
  }
}

export async function setTextInInput(name: string, text: string, browser: Browser) {
  const input = await browser.$(`//label[contains(text(), "${name}")]/..//input`)
  await clickOn(input, browser, 1)
  await input.clearValue()
  await browser.keys(text)
}

export async function moveToCenterOfElement(element: Element, browser: Browser) {
  const { x, y } = await element.getLocation()
  const { width, height } = await element.getSize()

  const targetX = x + width / 2
  const targetY = y + height / 2

  const duration = fast ? 1 : 500

  const js = `window.demo.moveMouse(${targetX}, ${targetY}, ${duration});`
  await browser.execute(js)
  await sleep(duration)
  await sleep(250, true)

  await element.moveTo()
}

export async function clickOnHistory(browser: Browser) {
  const messageHistory = await browser.$('//span/*[contains(text(), "History")]')
  await clickOn(messageHistory, browser)
}

export async function clickOn(element: Element, browser: Browser, clicks = 1) {
  await moveToCenterOfElement(element, browser)
  for (let i = 0; i < clicks; i += 1) {
    await element.click()
    await sleep(50)
  }
}

export async function createFakeMousePointer(browser: Browser) {
  const js = 'window.demo.enableMouse();'

  await browser.execute(js)
}

export async function showText(
  text: string,
  duration: number = 0,
  browser: Browser,
  location: 'top' | 'bottom' | 'middle' = 'bottom',
  keys = []
) {
  const js = `window.demo.showMessage('${text}', '${location}', ${duration});`

  await browser.execute(js)
}

type HeapDump = any

export async function getHeapDump(browser: Browser): Promise<HeapDump> {
  const filename = 'heapdump.json'
  const js = `window.demo.writeHeapdump('${filename}');`
  await browser.execute(js)
  const buffer = fs.readFileSync(filename)
  fs.unlinkSync(filename)

  return JSON.parse(buffer.toString())
}

export enum ClassNameMapping {
  TreeNode = 'TreeNode_TreeNode',
  TreeNodeComponent = 'TreeNode_TreeNodeComponent',
  Tree = 'Tree_Tree',
}

export async function countInstancesOf(heapDump: HeapDump, className: ClassNameMapping): Promise<number> {
  return heapDump.nodes.map((idx: number) => heapDump.strings[idx]).filter((s: string) => s === className).length
}

export async function showKeys(
  text: string,
  duration: number = 0,
  browser: Browser,
  location: 'top' | 'bottom' | 'middle' = 'bottom',
  keys: Array<string> = []
) {
  const js = `window.demo.showMessage('${text}', '${location}', ${duration}, ${JSON.stringify(keys)});`

  await browser.execute(js)
}

export async function hideText(browser: Browser) {
  const js = 'window.demo.hideMessage();'
  await browser.execute(js)
  await sleep(600)
}
