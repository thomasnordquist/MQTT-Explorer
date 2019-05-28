import { clickOn, sleep, writeText, expandTopic, clickOnHistory } from '../util'
import { Browser } from 'webdriverio'

export async function showNumericPlot(browser: Browser) {
  await expandTopic('livingroom/temperature', browser)

  await clickOnHistory(browser)
  await browser.saveScreenshot('screen2.png')
  await sleep(1000)
  await expandTopic('livingroom/humidity', browser)
}
