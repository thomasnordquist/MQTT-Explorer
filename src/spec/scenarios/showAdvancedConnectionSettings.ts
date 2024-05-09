import { Page } from 'playwright'
import { clickOn, sleep, setInputText } from '../util'

export async function showAdvancedConnectionSettings(browser: Page) {
  const advancedSettingsButton = await browser.locator('//button/span[contains(text(),"Advanced")]')
  const addButton = await browser.locator('//button/span[contains(text(),"Add")]')
  const topicInput = await browser.locator('//*[contains(@class, "advanced-connection-settings-topic-input")]//input')

  await clickOn(advancedSettingsButton)
  await setInputText(topicInput, 'garden/#', browser)
  await clickOn(addButton)

  await setInputText(topicInput, 'livingroom/#', browser)
  await clickOn(addButton)

  await deleteFirstSubscribedTopic(browser)
  await deleteFirstSubscribedTopic(browser)
  await sleep(1000)

  const backButton = await browser.locator('//button/span[contains(text(),"Back")]').first()
  await clickOn(backButton)

  const connectButton = await browser.locator('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton)
}

async function deleteFirstSubscribedTopic(browser: Page) {
  const deleteButton = await browser.locator('.advanced-connection-settings-topic-list button').first()
  await clickOn(deleteButton)
}
