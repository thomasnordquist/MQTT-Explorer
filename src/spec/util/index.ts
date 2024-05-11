import * as fs from 'fs'

import { Page, Locator } from 'playwright'

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

export async function writeText(text: string, element: Locator, delay = 0) {
  return element.fill(text)
}

export async function deleteTextWithBackspaces(element: Locator, delay = 0, count = 0) {
  // @ts-ignore
  const length = count > 0 ? count : (await element.textContent()).length
  for (let i = 0; i < length; i += 1) {
    await element.press('Backspace')
    await sleep(delay)
  }
}

export async function setInputText(input: Locator, text: string, browser: Page) {
  await clickOn(input, 1)
  await deleteTextWithBackspaces(input)
  await input.fill(text)
}

export async function setTextInInput(name: string, text: string, browser: Page) {
  const input = await browser.locator(`//label[contains(text(), "${name}")]/..//input`)
  await clickOn(input, 1)
  await browser.locator(`//label[contains(text(), "${name}")]/..//input`)

  await deleteTextWithBackspaces(input)
  await input.fill(text)
}

export async function moveToCenterOfElement(element: Locator) {
  // @ts-ignore
  const { x, y, width, height } = await element.boundingBox()

  const targetX = x + width / 2
  const targetY = y + height / 2

  const duration = fast ? 1 : 500

  const js = `window.demo.moveMouse(${targetX}, ${targetY}, ${duration});`
  await runJavascript(js, element.page())
  await sleep(duration)
  await sleep(250, true)
}

export async function runJavascript(js: string, browser: Page) {
  // there is probably a safer way to do this.. do not use eval...
  // tslint:disable-next-line no-eval
  return browser.evaluate(script => eval(script), js)
}

export async function clickOnHistory(browser: Page) {
  const messageHistory = await browser.locator('//span/*[contains(text(), "History")]').first()
  await clickOn(messageHistory)
}

export async function clickOn(
  element: Locator,
  clicks = 1,
  delay = 0,
  button: 'left' | 'right' | 'middle' = 'left',
  force = false
) {
  await moveToCenterOfElement(element)
  await element.hover()
  await element.click({ delay, button, force, clickCount: clicks })
  await sleep(50)
}

export async function createFakeMousePointer(browser: Page) {
  const js = 'window.demo.enableMouse();'
  // @ts-lint-ignore
  await runJavascript(js, browser)
}

export async function showText(
  text: string,
  duration: number = 0,
  browser: Page,
  location: 'top' | 'bottom' | 'middle' = 'bottom',
  keys = []
) {
  const js = `window.demo.showMessage('${text}', '${location}', ${duration});`

  await runJavascript(js, browser)
}

type HeapDump = any

export async function getHeapDump(browser: Page): Promise<HeapDump> {
  const filename = 'heapdump.json'
  const js = `window.demo.writeHeapdump('${filename}');`
  await runJavascript(js, browser)
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
  browser: Page,
  location: 'top' | 'bottom' | 'middle' = 'bottom',
  keys: Array<string> = []
) {
  const js = `window.demo.showMessage('${text}', '${location}', ${duration}, ${JSON.stringify(keys)});`

  await runJavascript(js, browser)
}

export async function hideText(browser: Page) {
  const js = 'window.demo.hideMessage();'
  await runJavascript(js, browser)
  await sleep(600)
}
