import { clickOn, sleep, writeText, expandTopic } from '../util'
import { Browser } from 'webdriverio'

export async function showJsonPreview(browser: Browser<void>) {
  await expandTopic('actuality/showcase', browser)

  await sleep(1000)
}
