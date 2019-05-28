import { clickOn, sleep, writeText, expandTopic } from '../util'
import { Browser } from 'webdriverio'

export async function copyValueToClipboard(browser: Browser) {
  const copyButton = await browser.$('//p[contains(text(), "Value")]/span')
  await clickOn(copyButton, browser, 1)
}
