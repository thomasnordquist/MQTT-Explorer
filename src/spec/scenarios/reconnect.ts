import { Page } from 'playwright'
import { clickOn } from '../util'

export async function reconnect(browser: Page) {
  const disconnectButton = browser.locator('[data-testid="disconnect-button"]')
  await clickOn(disconnectButton)
  const connectButton = browser.locator('[data-testid="connect-button"]')
  await clickOn(connectButton)
}
