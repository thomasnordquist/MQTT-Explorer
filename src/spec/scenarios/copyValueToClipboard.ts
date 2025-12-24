import { Page } from 'playwright'
import { clickOn } from '../util'

export async function copyValueToClipboard(browser: Page) {
  // Select the copy button specifically in the Value panel (not Topic panel or MessageHistory)
  const copyButton = browser.getByRole('button', { name: /Value/i }).getByTestId('copy-button')
  await clickOn(copyButton, 1)
}
