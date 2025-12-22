import { clickOn, setTextInInput } from '../util'
import { Page, Locator } from 'playwright'
export async function connectTo(host: string, browser: Page) {
  await setTextInInput('Host', host, browser)

  await browser.screenshot({ path: 'screen1.png' })

  // Material-UI v5 changed button text to uppercase
  const connectButton = await browser.locator('//button/span[contains(text(),"CONNECT")]')
  await clickOn(connectButton)
}
