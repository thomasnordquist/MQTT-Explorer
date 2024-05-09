import { Page } from 'playwright'
import { clickOn } from '../util'

export async function reconnect(browser: Page) {
  const disconnectButton = await browser.locator('//button/span[contains(text(),"Disconnect")]')
  await clickOn(disconnectButton)
  const connectButton = await browser.locator('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton)
}
