import { Page } from 'playwright'
import { clickOn } from '../util'

export async function disconnect(browser: Page) {
  const disconnectButton = browser.locator('[data-testid="disconnect-button"]')
  await clickOn(disconnectButton)
}
