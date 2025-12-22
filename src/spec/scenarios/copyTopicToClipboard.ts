import { Page } from 'playwright'
import { clickOn } from '../util'

export async function copyTopicToClipboard(browser: Page) {
  const copyButton = await browser.locator('[data-testid="copy-button"]')
  await clickOn(copyButton, 1)
}
