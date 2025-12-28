import { Page } from 'playwright'
import { clickOn } from '../util'

export async function saveMessageToFile(browser: Page) {
  // Select the save button in the new sidebar structure (directly by testid)
  const saveButton = browser.getByTestId('save-button')
  await clickOn(saveButton, 1)
}
