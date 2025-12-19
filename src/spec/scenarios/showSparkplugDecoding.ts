import { Page } from 'playwright'
import { expandTopic, sleep } from '../util'

export async function showSparkPlugDecoding(browser: Page) {
  // spell-checker: disable-next-line
  await expandTopic('spBv1.0/Sparkplug Devices/DDATA/JavaScript Edge Node/Emulated Device', browser)
  await browser.screenshot({ path: 'screen_sparkplugb_decoding.png' })
  await sleep(1000)
}
