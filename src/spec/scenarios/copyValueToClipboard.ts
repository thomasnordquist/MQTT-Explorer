import { Browser, Element } from 'webdriverio'
import { clickOn, expandTopic, sleep, writeText } from '../util'

export async function copyValueToClipboard(browser: Browser) {
  const copyButton = await browser.$('//p[contains(text(), "Value")]/span')
  await clickOn(copyButton, browser, 1)
}
