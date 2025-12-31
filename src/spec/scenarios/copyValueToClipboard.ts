import { Page } from 'playwright'
import { clickOn } from '../util'

export async function copyValueToClipboard(browser: Page) {
  // Select the second copy button (value copy button in the new sidebar structure)
  // The new sidebar has copy buttons in the topic section (for path) and value section (for value)
  const copyButtons = browser.getByTestId('copy-button')
  const copyButton = copyButtons.nth(1) // Second copy button is for the value
  await clickOn(copyButton, 1)
}
