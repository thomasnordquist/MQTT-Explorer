import { Browser, Element } from 'webdriverio'
import { clickOn, sleep, setTextInInput } from '../util'

export async function showAdvancedConnectionSettings(browser: Browser) {
  const advancedSettingsButton = await browser.$('//button/span[contains(text(),"Advanced")]')
  const addButton = await browser.$('//button/span[contains(text(),"Add")]')

  await clickOn(advancedSettingsButton, browser)
  await setTextInInput('Subscription', 'garden/#', browser)
  await clickOn(addButton, browser)

  await setTextInInput('Subscription', 'livingroom/#', browser)
  await clickOn(addButton, browser)

  await deleteFirstSubscribedTopic(browser)
  await deleteFirstSubscribedTopic(browser)
  await sleep(1000)

  const backButton = await browser.$('//button/span[contains(text(),"Back")]')
  await clickOn(backButton, browser)

  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton, browser)
}

async function deleteFirstSubscribedTopic(browser: Browser) {
  const deleteButton = await browser.$('.advanced-connection-settings-topic-list button')
  await clickOn(deleteButton, browser)
}
