import { Page } from 'playwright'
import { clickOn } from '../util'

export async function copyTopicToClipboard(browser: Page) {
  // Select the copy button specifically in the Topic panel (not Value panel or MessageHistory)
  const copyButton = browser.getByRole('button', { name: /Topic/i }).getByTestId('copy-button')
  await clickOn(copyButton, 1)
}
