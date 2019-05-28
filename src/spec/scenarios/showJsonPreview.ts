import { Browser } from 'webdriverio'
import { expandTopic, sleep } from '../util'

export async function showJsonPreview(browser: Browser) {
  await expandTopic('actuality/showcase', browser)
  await browser.saveScreenshot('screen3.png')
  await sleep(1000)
}
