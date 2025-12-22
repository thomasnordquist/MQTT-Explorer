import { Page } from 'playwright'
import { clickOn, sleep, setInputText } from '../util'

export async function showAdvancedConnectionSettings(browser: Page) {
  const advancedSettingsButton = browser.locator('[data-testid="advanced-button"]')
  const addButton = browser.locator('[data-testid="add-subscription-button"]')
  const topicInput = browser.locator('//*[contains(@class, "advanced-connection-settings-topic-input")]//input')

  await clickOn(advancedSettingsButton)
  await setInputText(topicInput, 'garden/#', browser)
  await clickOn(addButton)

  await setInputText(topicInput, 'livingroom/#', browser)
  await clickOn(addButton)

  await deleteFirstSubscribedTopic(browser)
  await deleteFirstSubscribedTopic(browser)
  await sleep(1000)

  const backButton = browser.locator('[data-testid="back-button"]').first()
  await clickOn(backButton)

  const connectButton = browser.locator('[data-testid="connect-button"]')
  await clickOn(connectButton)
}

async function deleteFirstSubscribedTopic(browser: Page) {
  const deleteButton = browser.locator('.advanced-connection-settings-topic-list button').first()
  await clickOn(deleteButton)
}
