import { Page, Locator } from 'playwright'
import { expandTopic, sleep } from '../util'

export async function showJsonPreview(browser: Page) {
  await expandTopic('actuality/showcase', browser)
  try {
    await browser.screenshot({ path: 'screen3.png' })
  } catch (error) {
    // Screenshot may fail in headed mode
  }
  await sleep(1000)
}
