import { Page } from 'playwright'
import { clickOn } from '../util'

export async function copyTopicToClipboard(browser: Page) {
  const copyButton = await browser.locator('//span[contains(text(), "Topic")]//button[1]')
  await clickOn(copyButton, 1)
}
