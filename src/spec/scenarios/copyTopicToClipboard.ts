import { Browser, Element } from 'webdriverio'
import { clickOn } from '../util'

export async function copyTopicToClipboard(browser: Browser) {
  const copyButton = await browser.$('//p[contains(text(), "Topic")]/span')
  await clickOn(copyButton, browser, 1)
}
