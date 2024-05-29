import { Page, Locator } from 'playwright'
import {
  clickOn,
  sleep,
  writeText,
  deleteTextWithBackspaces,
  expandTopic,
  moveToCenterOfElement,
  showText,
} from '../util'

export async function publishTopic(browser: Page) {
  await expandTopic('kitchen/lamp/state', browser)
  const topicInput = await browser.locator('//input[contains(@value,"kitchen/lamp/state")][1]')
  await clickOn(topicInput)
  await deleteTextWithBackspaces(topicInput, 120, 5)
  await writeText('set', topicInput)

  const payloadInput = await browser.locator('//*[contains(@class, "ace_text-input")]')
  await writeTextPayload(payloadInput, 'off')
  await sleep(500)
  const formatJsonButton = await browser.locator('#sidebar-publish-format-json')
  await clickOn(formatJsonButton)

  const publishButton = await browser.locator('#publish-button')
  await moveToCenterOfElement(publishButton)
  await showText('Lamp turns on', 1000, browser, 'top')
  await sleep(500)

  await clickOn(publishButton)

  const sidebarDrawer = await browser.locator('#Sidebar')
  await sidebarDrawer.scrollIntoViewIfNeeded()
}

async function writeTextPayload(payloadInput: Locator, text: string) {
  await clickOn(payloadInput)
  await writeText(text, payloadInput)
}
