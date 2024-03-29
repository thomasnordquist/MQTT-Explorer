import { Browser } from 'webdriverio'
import { clickOn, sleep, setInputText } from '../util'

export async function showAdvancedConnectionSettings(browser: Browser<'async'>) {
  const advancedSettingsButton = await browser.$('//button/span[contains(text(),"Advanced")]')
  const addButton = await browser.$('//button/span[contains(text(),"Add")]')
  const topicInput = await browser.$('//*[contains(@class, "advanced-connection-settings-topic-input")]//input')

  await clickOn(advancedSettingsButton, browser)
  await setInputText(topicInput, 'garden/#', browser)
  await clickOn(addButton, browser)

  await setInputText(topicInput, 'livingroom/#', browser)
  await clickOn(addButton, browser)

  await deleteFirstSubscribedTopic(browser)
  await deleteFirstSubscribedTopic(browser)
  await sleep(1000)

  const backButton = await browser.$('//button/span[contains(text(),"Back")]')
  await clickOn(backButton, browser)

  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton, browser)
}

async function deleteFirstSubscribedTopic(browser: Browser<'async'>) {
  const deleteButton = await browser.$('.advanced-connection-settings-topic-list button')
  await clickOn(deleteButton, browser)
}
