import { Page } from 'playwright'
import { clickOn } from '../util'

export async function saveMessageToFile(browser: Page) {
  // Select the save button specifically in the Value panel
  const saveButton = browser.getByRole('button', { name: /Value/i }).getByTestId('save-button')
  await clickOn(saveButton, 1)
}
