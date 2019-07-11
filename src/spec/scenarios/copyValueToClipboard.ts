import { Browser } from 'webdriverio'
import { clickOn } from '../util'

export async function copyValueToClipboard(browser: Browser) {
  const copyButton = await browser.$('//span[contains(text(), "Value")]//button')
  await clickOn(copyButton, browser, 1)
}
