import { clickOn, sleep, writeText, expandTopic, moveToCenterOfElement } from '../util'
import { Browser } from 'webdriverio'

export async function clearOldTopics(browser: Browser<void>) {
  const topics = ['hello', 'test 123']
  for (const topic of topics) {
    await expandTopic(topic, browser)
    await sleep(1000)

    const deleteButton = await browser.$('//button[contains(@title, "Delete retained topic")]')
    await moveToCenterOfElement(deleteButton, browser)
    await clickOn(deleteButton, browser)
    await sleep(700)
  }
}
