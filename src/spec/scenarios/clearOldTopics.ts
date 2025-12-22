import { Page } from 'playwright'
import {
  clickOn, expandTopic, moveToCenterOfElement, sleep, writeText,
} from '../util'

export async function clearOldTopics(browser: Page) {
  const topics = ['hello', 'test 123']
  for (const topic of topics) {
    await expandTopic(topic, browser)
    await sleep(1000)

    const deleteButton = await browser.locator('//button[contains(@title, "Delete retained topic")]')
    await moveToCenterOfElement(deleteButton)
    await clickOn(deleteButton)
    await sleep(700)
  }
}
