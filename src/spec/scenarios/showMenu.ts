import { clickOn, sleep, writeText, expandTopic, moveToCenterOfElement, showText } from '../util'
import { Browser } from 'webdriverio'

export async function showMenu(browser: Browser<void>) {
  const menuButton = await browser.$('//button[contains(@aria-label, "Menu")]')
  await clickOn(menuButton, browser)

  // const brokerStatistics = await browser.$('//div[contains(@class, "BrokerStatistics")]/div[1]')
  // moveToCenterOfElement(brokerStatistics, browser)
  await sleep(2000)

  await browser.saveScreenshot('screen4.png')

  const topicOrder = await browser.$('#select-node-order')
  await clickOn(topicOrder, browser)
  await sleep(1000)

  const alphabetically = await browser.$('//li[contains(@data-value, "abc")]')
  await clickOn(alphabetically, browser)
  await sleep(2000)

  await showText('Dark Mode', 1500, browser, 'top')
  await sleep(1500)
  const themeSwitch = await browser.$('//*[contains(text(), "Dark Mode")]/..//input')
  await clickOn(themeSwitch, browser)
  await sleep(3000)
  await browser.saveScreenshot('screen_dark_mode.png')
  await clickOn(themeSwitch, browser)

  await clickOn(menuButton, browser)
}
