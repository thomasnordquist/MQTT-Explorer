import { Browser, Element } from 'webdriverio'
import { expandTopic, sleep } from '../util'

export async function showJsonPreview(browser: Browser<'async'>) {
  await expandTopic('actuality/showcase', browser)
  await browser.saveScreenshot('screen3.png')
  await sleep(1000)
}
