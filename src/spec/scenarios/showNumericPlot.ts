import { clickOn, sleep, writeText, expandTopic } from '../util'
import { Browser } from 'webdriverio'

export async function showNumericPlot(browser: Browser<void>) {
  await expandTopic('livingroom/temperature', browser)

  const messageHistory = await browser.$('//span/*[contains(text(), "History")]')
  await clickOn(messageHistory, browser, 1)

  await sleep(1000)
  await expandTopic('livingroom/humidity', browser)
}
