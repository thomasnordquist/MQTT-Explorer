import { Element, Browser } from 'webdriverio'
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

export async function moveToCenterOfElement(element: Element<void>, browser: Browser<void>) {
  const { x, y } = await element.getLocation()
  const { width, height } = await element.getSize()

  const js = `{
    const targetX = ${x + width / 2}
    const targetY = ${y + height / 2}
    const duration = 500

    const maxStepSize = 10
    const e = document.getElementById("bier")
    const top = parseFloat(e.style.top)
    const left = parseFloat(e.style.left)
    const deltaY = targetY - top
    const deltaX = targetX - left

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const steps = Math.ceil(distance / maxStepSize)

    const stepX = deltaX / steps
    const stepY = deltaY / steps
    let currentStep = 0
    function getCloser() {
      e.style.left = String(left + (stepX * currentStep)) + 'px'
      e.style.top = String(top + (stepY * currentStep)) + 'px'
      if (currentStep < steps) {
        setTimeout(() => {
          currentStep += 1
          if (currentStep === steps) {
            e.style.left = String(targetX + 5) + 'px'
            e.style.top = String(targetY + 1) + 'px'
          } else {
            getCloser()
          }
        }, duration/steps)
      }
    }
	  getCloser()
  }`
  await browser.execute(js)
  await sleep(550, true)
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
  const addCursorImage = 'const i=document.createElement("img");'
  + 'i.src="../cursor.png";'
  + 'i.width="32";'
  + 'i.height="32";'
  + 'i.id="bier";'
  + 'i.style="position: fixed; z-index:10000000; filter: invert(100%);left: 0px; top: 0px;";'
  + 'document.body.appendChild(i)'

  await browser.execute(addCursorImage)
}

export async function showText(text: string, duration: number = 0, browser: Browser<void>, location: 'top' | 'bottom' | 'middle' = 'bottom') {
  const positions = {
    top: 0,
    bottom: -65,
    middle: -32,
  }
  const js = `
    const postition = "${positions[location]}vh"
    let previousDiv = document.getElementById('tests-text-overlay')
    previousDiv && previousDiv.remove()
    let div = document.createElement('div')
    div.id = "tests-text-overlay"
    div.style = "background-color: rgba(0, 0, 0, 0.8);position: fixed;left: 5vw;z-index: 1000000;margin: 30vw auto 50vw;border-radius: 16px;right: 5vw;bottom: "+ postition +";"
    let div2 = document.createElement('div')
    div2.style = "text-align: center;font-size: 4em;color: white;"
    div2.innerHTML = \`${text}\`
    div.appendChild(div2)
    document.body.appendChild(div)
    if (${duration} > 0) {
      setTimeout(() => div.remove(), ${duration})
    }
  `
  browser.execute(js)
}

export async function hideText(browser: Browser<void>) {
  const js = `
    let previousDiv = document.getElementById('tests-text-overlay')
    previousDiv && previousDiv.remove()
  `
  browser.execute(js)
  await sleep(600)
}
