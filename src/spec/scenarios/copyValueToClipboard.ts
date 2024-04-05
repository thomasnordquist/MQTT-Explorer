import { Page } from 'playwright'
import { clickOn } from '../util'

export async function copyValueToClipboard(browser: Page) {
  const copyButton = await browser.locator('//span[contains(text(), "Value")]//button')
  await clickOn(copyButton, 1)
}
