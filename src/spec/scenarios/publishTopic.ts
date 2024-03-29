import { Browser, Element } from 'webdriverio'
import {
  clickOn,
  sleep,
  writeText,
  deleteTextWithBackspaces,
  expandTopic,
  moveToCenterOfElement,
  showText,
} from '../util'

export async function publishTopic(browser: Browser<'async'>) {
  await expandTopic('kitchen/lamp/state', browser)
  const topicInput = await browser.$('//input[contains(@value,"kitchen/lamp/state")][1]')
  await clickOn(topicInput, browser)
  await deleteTextWithBackspaces(topicInput, browser, 120, 5)
  await writeText('set', browser, 300)

  const payloadInput = await browser.$('//*[contains(@class, "ace_text-input")]')
  await writeTextPayload(payloadInput, 'off')
  await sleep(500)
  const formatJsonButton = await browser.$('#sidebar-publish-format-json')
  await clickOn(formatJsonButton, browser)

  const publishButton = await browser.$('#publish-button')
  await moveToCenterOfElement(publishButton, browser)
  await showText('Lamp turns on', 1000, browser, 'top')
  await sleep(500)

  await clickOn(publishButton, browser)

  const sidebarDrawer = await browser.$('#Sidebar')
  await sidebarDrawer.scrollIntoView()
}

async function writeTextPayload(payloadInput: any, text: string) {
  await payloadInput.setValue(text)
}
