import { Page } from 'playwright'
import { clickOn } from '../util'

export async function copyTopicToClipboard(browser: Page) {
  // Select the first copy button (topic path copy button in the new sidebar structure)
  // The new sidebar has copy buttons in the topic section (for path) and value section (for value)
  const copyButtons = browser.getByTestId('copy-button')
  const copyButton = copyButtons.first()
  await clickOn(copyButton, 1)
}
