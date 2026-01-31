import * as fs from 'fs'

import { Page, Locator } from 'playwright'

export { expandTopic } from './expandTopic'
export { selectTopic } from './selectTopic'

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

export async function writeText(text: string, element: Locator, delay = 30) {
  element.pressSequentially(text, { delay })
}

export async function deleteTextWithBackspaces(element: Locator, delay = 30, count = 0) {
  const length = count > 0 ? count : (await element.inputValue()).length
  for (let i = 0; i < length; i += 1) {
    await element.press('Backspace', { delay: 30 })
    await sleep(delay)
  }
}

export async function setInputText(input: Locator, text: string, browser: Page) {
  await clickOn(input, 1)
  await deleteTextWithBackspaces(input)
  await input.fill(text)
}

export async function setTextInInput(name: string, text: string, browser: Page) {
  // Try data-testid first, then fall back to label-based selectors for Material-UI v5
  const selectors = [
    `[data-testid="${name.toLowerCase()}-input"]`,
    `//label[contains(text(), "${name}")]/..//input`,
    `//div[contains(@class, 'MuiTextField')]//label[contains(text(), "${name}")]/..//input`,
    `//input[@name="${name.toLowerCase()}"]`,
  ]

  let input: Locator | null = null
  for (const selector of selectors) {
    const locator = browser.locator(selector)
    const count = await locator.count()
    if (count > 0) {
      input = locator.first()
      break
    }
  }

  if (!input) {
    throw new Error(`Could not find input for label "${name}"`)
  }

  await clickOn(input, 1)
  await deleteTextWithBackspaces(input)
  await input.fill(text)
}

export async function moveToCenterOfElement(element: Locator) {
  // Wait for element to be visible and attached before getting bounding box
  await element.waitFor({ state: 'visible', timeout: 30000 })

  const boundingBox = await element.boundingBox()

  if (!boundingBox) {
    throw new Error('Could not get bounding box for element')
  }

  const { x, y, width, height } = boundingBox

  const targetX = x + width / 2
  const targetY = y + height / 2

  const duration = fast ? 1 : 500

  try {
    const js = `window.demo.moveMouse(${targetX}, ${targetY}, ${duration});`
    await runJavascript(js, element.page())
    // IMPORTANT: Wait for animation to complete before returning
    // The animation duration + a small buffer for frame rendering
    await sleep(duration, true) // Use required=true to ensure we actually wait
    await sleep(100, true) // Extra buffer for the last frame
  } catch (error) {
    // window.demo.moveMouse might not be available in all test environments
    // This is fine - we'll proceed with the click anyway
    console.log('moveMouse not available, proceeding without custom mouse movement')
  }
}

export async function runJavascript(js: string, browser: Page) {
  // there is probably a safer way to do this.. do not use eval...
  // tslint:disable-next-line no-eval
  return browser.evaluate(script => eval(script), js)
}

export async function clickOnHistory(browser: Page) {
  const messageHistory = await browser.locator('[data-testid="message-history"]').first()
  await clickOn(messageHistory)
}

export async function clickOn(
  element: Locator,
  clicks = 1,
  delay = 0,
  button: 'left' | 'right' | 'middle' = 'left',
  force = false
) {
  // Ensure element is visible before trying to interact
  await element.waitFor({ state: 'visible', timeout: 30000 })

  // Scroll element into view first (important for mobile viewports)
  await element.scrollIntoViewIfNeeded()
  await sleep(100)

  // Skip hover when force is true (used when modal backdrop might intercept)
  if (!force) {
    try {
      // Move the simulated mouse cursor and wait for animation to complete
      await moveToCenterOfElement(element)
      // Now hover with the real cursor (this is instant but comes after animation)
      await element.hover()
      // Small delay after hover for visual smoothness
      await sleep(50, true)
    } catch (error) {
      // If custom mouse movement fails, we can still proceed with the click
      // Playwright's click will handle scrolling into view automatically
      console.log('Custom mouse movement failed, proceeding with direct click')
    }
  }
  // Click happens after simulated cursor has reached its destination
  await element.click({
    delay,
    button,
    force,
    clickCount: clicks,
  })
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
