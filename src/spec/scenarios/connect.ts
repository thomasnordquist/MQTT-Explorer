import { Page } from 'playwright'
import { clickOn, setTextInInput } from '../util'

export async function connectTo(host: string, browser: Page) {
  await setTextInInput('Host', host, browser)

  // Try to capture screenshot (may fail in headed mode)
  try {
    await browser.screenshot({ path: 'screen1.png' })
  } catch (error) {
    // Screenshot may fail in headed mode, that's ok
  }

  // Use data-testid for reliable button location
  const connectButton = browser.locator('[data-testid="connect-button"]')
  await clickOn(connectButton)
}
