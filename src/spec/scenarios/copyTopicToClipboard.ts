import { Browser } from 'webdriverio'
import { clickOn } from '../util'

export async function copyTopicToClipboard(browser: Browser<'async'>) {
  const copyButton = await browser.$('//span[contains(text(), "Topic")]//button')
  await clickOn(copyButton, browser, 1)
}
