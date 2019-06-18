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

export async function publishTopic(browser: Browser) {
  await expandTopic('kitchen/lamp/state', browser)
  const topicInput = await browser.$('//textarea[contains(text(),"kitchen/lamp/state")][1]')
  await clickOn(topicInput, browser)
  await deleteTextWithBackspaces(topicInput, browser, 120, 5)
  await writeText('set', browser, 300)

  const payloadInput = await browser.$('//*[contains(@class, "ace_text-input")]')
  await payloadInput.setValue('o')
  await sleep(300)
  await payloadInput.setValue('n')
  await sleep(700)

  const publishButton = await browser.$('#publish-button')
  await moveToCenterOfElement(publishButton, browser)
  await showText('Lamp turns on', 1000, browser, 'top')
  await sleep(500)

  await clickOn(publishButton, browser)
}
