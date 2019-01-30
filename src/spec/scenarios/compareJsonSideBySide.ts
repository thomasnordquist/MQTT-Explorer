import { clickOn, sleep, writeText, expandTopic, hideText } from '../util'
import { Browser } from 'webdriverio'

// Expects a topic with at least two messages to be selected
export async function compareJsonSideBySide(browser: Browser<void>) {
  const firstEntry = await browser.$('//span[contains(text(), "History")]/../../div/div[1]/div')
  const secondEntry = await browser.$('//span[contains(text(), "History")]/../../div/div[2]/div')
  await clickOn(secondEntry, browser)
  await sleep(2000)
  await clickOn(firstEntry, browser)
  await sleep(2000)
  await clickOn(firstEntry, browser)
  await sleep(1000)
}
