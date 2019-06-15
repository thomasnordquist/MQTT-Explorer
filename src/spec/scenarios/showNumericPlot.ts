import { Browser, Element } from 'webdriverio'
import { clickOn, clickOnHistory, expandTopic, sleep, writeText } from '../util'

export async function showNumericPlot(browser: Browser) {
  await expandTopic('livingroom/temperature', browser)

  await clickOnHistory(browser)
  await browser.saveScreenshot('screen2.png')
  await sleep(1000)
  await expandTopic('livingroom/humidity', browser)
}
