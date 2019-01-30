import { clickOn, sleep, writeText, delteTextWithBackspaces, showText } from '../util'
import { Browser } from 'webdriverio'

export async function searchTree(text: string, browser: Browser<void>) {
  const searchField = await browser.$('//input[contains(@placeholder, "Search")]')
  await clickOn(searchField, browser, 1)
  await writeText(text, browser, 100)
  await sleep(1500)
}

export async function clearSearch(browser: Browser<void>) {
  const searchField = await browser.$('//input[contains(@placeholder, "Search")]')
  await clickOn(searchField, browser, 1)
  await delteTextWithBackspaces(searchField, browser, 100)
}
