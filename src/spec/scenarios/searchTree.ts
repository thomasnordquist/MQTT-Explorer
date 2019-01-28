import { clickOn, sleep, writeText } from '../util'
import { Browser } from 'webdriverio'

export async function searchTree(browser: Browser<void>) {
  const searchField = await browser.$('//input[contains(@placeholder, "Search")]')
  await clickOn(searchField, browser, 1)
  writeText('temp', browser)
}
