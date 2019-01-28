import { clickOn, sleep, writeText, expandTopic } from '../util'
import { Browser } from 'webdriverio'

export async function copyTopicToClipboard(browser: Browser<void>) {
  const copyButton = await browser.$('//p[contains(text(), "Topic")]/span')
  await clickOn(copyButton, browser, 1)
}
