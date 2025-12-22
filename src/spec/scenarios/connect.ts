import { Page } from 'playwright'
import { clickOn, setTextInInput } from '../util'

export async function connectTo(host: string, browser: Page) {
  await setTextInInput('Host', host, browser)

  await browser.screenshot({ path: 'screen1.png' })

  // Use data-testid for reliable button location
  const connectButton = browser.locator('[data-testid="connect-button"]')
  await clickOn(connectButton)
}
