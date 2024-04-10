import { Page, Locator } from 'playwright'
import { expandTopic, sleep } from '../util'

export async function showJsonPreview(browser: Page) {
  await expandTopic('actuality/showcase', browser)
  await browser.screenshot({ path: 'screen3.png' })
  await sleep(1000)
}
