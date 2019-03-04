import { clickOn, writeTextToInput, sleep } from '../util'
import { Browser } from 'webdriverio'

export async function showAdvancedConnectionSettings(browser: Browser<void>) {
  const advancedSettingsButton = await browser.$('//button/span[contains(text(),"Advanced")]')
  const addButton = await browser.$('//button/span[contains(text(),"Add")]')

  await clickOn(advancedSettingsButton, browser)
  await writeTextToInput('Subscription', 'garden/#', browser, false)
  await clickOn(addButton, browser)

  await writeTextToInput('Subscription', 'livingroom/#', browser, false)
  await clickOn(addButton, browser)

  await deleteFirstSubscribedTopic(browser)
  await deleteFirstSubscribedTopic(browser)
  await sleep(1000)

  const backButton = await browser.$('//button/span[contains(text(),"Back")]')
  await clickOn(backButton, browser)

  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton, browser)
}

async function deleteFirstSubscribedTopic(browser: Browser<void>) {
  const deleteButton = await browser.$('//*[contains(@class,"topicList")]//button')
  await clickOn(deleteButton, browser)
}
