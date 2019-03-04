import { Browser, Element } from 'webdriverio'
export { expandTopic } from './expandTopic'

export function sleep(ms: number, required = false) {
  return new Promise((resolve) => {
    if (required) {
      setTimeout(resolve, ms)
    } else {
      setTimeout(resolve, ms)
    }
  })
}

export async function writeText(text: string, browser: Browser<void>, delay = 0) {
  for (const c of text.split('')) {
    await browser.keys([c])
    await sleep(delay)
  }
}

export async function delteTextWithBackspaces(element: Element<void>, browser: Browser<void>, delay = 0, count = 0) {
  const length = count > 0 ? count : (await element.getValue()).length
  for (let i = 0; i < length; i += 1) {
    await browser.keys(['Backspace'])
    await sleep(delay)
  }
}

export async function writeTextToInput(name: string, text: string, browser: Browser<void>, wait: boolean = true) {
  const input = await browser.$(`//label[contains(text(), "${name}")]/..//input`)
  await clickOn(input, browser, 1)
  wait && await sleep(500)
  input.clearValue()
  wait && await sleep(300)
  await writeText(text, browser)
}

export async function moveToCenterOfElement(element: Element<void>, browser: Browser<void>) {
  const { x, y } = await element.getLocation()
  const { width, height } = await element.getSize()

  const targetX = x + width / 2
  const targetY = y + height / 2

  const duration = 500

  const js = `window.demo.moveMouse(${targetX}, ${targetY}, ${duration});`
  await browser.execute(js)
  await sleep(duration + 500, true)

  await element.moveTo()
}

export async function clickOnHistory(browser: Browser<void>) {
  const messageHistory = await browser.$('//span/*[contains(text(), "History")]')
  await clickOn(messageHistory, browser)
}

export async function clickOn(element: Element<void>, browser: Browser<void>, clicks = 1) {
  await moveToCenterOfElement(element, browser)
  for (let i = 0; i < clicks; i += 1) {
    await element.click()
    await sleep(50)
  }
}

export async function createFakeMousePointer(browser: Browser<void>) {
  const js = 'window.demo.enableMouse();'

  await browser.execute(js)
}

export async function showText(text: string, duration: number = 0, browser: Browser<void>, location: 'top' | 'bottom' | 'middle' = 'bottom', keys = []) {
  const js = `window.demo.showMessage('${text}', '${location}', ${duration});`

  browser.execute(js)
}

export async function showKeys(text: string, duration: number = 0, browser: Browser<void>, location: 'top' | 'bottom' | 'middle' = 'bottom', keys: string[] = []) {
  const js = `window.demo.showMessage('${text}', '${location}', ${duration}, ${JSON.stringify(keys)});`

  browser.execute(js)
}

export async function hideText(browser: Browser<void>) {
  const js = 'window.demo.hideMessage();'
  browser.execute(js)
  await sleep(600)
}
