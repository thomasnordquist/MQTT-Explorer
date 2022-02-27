import { Browser } from 'webdriverio'
import { clickOn, showText, sleep } from '../util'

export async function showMenu(browser: Browser<'async'>) {
  const menuButton = await browser.$('//button[contains(@aria-label, "Menu")]')
  await clickOn(menuButton, browser)

  // const brokerStatistics = await browser.$('//div[contains(@class, "BrokerStatistics")]/div[1]')
  // moveToCenterOfElement(brokerStatistics, browser)
  await sleep(2000)

  await browser.saveScreenshot('screen4.png')

  const topicOrder = await browser.$('//input[@name="node-order"]/../div')
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
