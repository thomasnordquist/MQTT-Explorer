import { Page } from 'playwright'
import { clickOn } from '../util'

export async function copyValueToClipboard(browser: Page) {
  const copyButton = await browser.getByRole('button', { name: 'Value' }).getByRole('button').first()
  await clickOn(copyButton, 1)
}
