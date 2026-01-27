import { Page } from 'playwright'
import { clickOn, showText, sleep } from '../util'

export async function showMenu(browser: Page) {
  const menuButton = await browser.locator('//button[contains(@aria-label, "Menu")]')
  await clickOn(menuButton)

  // const brokerStatistics = await browser.$('//div[contains(@class, "BrokerStatistics")]/div[1]')
  // moveToCenterOfElement(brokerStatistics, browser)
  await sleep(2000)

  try {
    await browser.screenshot({ path: 'screen4.png' })
  } catch (error) {
    // Screenshot may fail in headed mode
  }

  const topicOrder = await browser.locator('//input[@name="node-order"]/../div')
  await clickOn(topicOrder)
  await sleep(1000)

  const alphabetically = await browser.locator('//li[contains(@data-value, "abc")]')
  await clickOn(alphabetically)
  await sleep(2000)

  await showText('Dark Mode', 1500, browser, 'top')
  await sleep(1500)
  const themeSwitch = await browser.locator('[data-testid="dark-mode-toggle"]')
  await clickOn(themeSwitch)
  await sleep(3000)
  try {
    await browser.screenshot({ path: 'screen_dark_mode.png' })
  } catch (error) {
    // Screenshot may fail in headed mode
  }
  await clickOn(themeSwitch)

  await clickOn(menuButton)
}
