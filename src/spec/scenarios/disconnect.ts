import { Page } from 'playwright'
import { clickOn } from '../util'

export async function disconnect(browser: Page) {
  const disconnectButton = await browser.locator('//button/span[contains(text(),"Disconnect")]')
  await clickOn(disconnectButton)
}
