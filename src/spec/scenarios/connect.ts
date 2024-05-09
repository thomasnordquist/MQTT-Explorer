import { clickOn, setTextInInput } from '../util'
import { Page, Locator } from 'playwright'
export async function connectTo(host: string, browser: Page) {
  await setTextInInput('Host', host, browser)

  await browser.screenshot({ path: 'screen1.png' })

  const connectButton = await browser.locator('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton)
}
