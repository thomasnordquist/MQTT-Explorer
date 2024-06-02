import { Page } from 'playwright'
import { clickOn, deleteTextWithBackspaces, showText, sleep, writeText } from '../util'

export async function searchTree(text: string, browser: Page) {
  const searchField = await browser.locator('//input[contains(@placeholder, "Search")]')
  await clickOn(searchField, 1)
  await writeText(text, searchField)
  await sleep(1500)
}

export async function clearSearch(browser: Page) {
  const searchField = await browser.locator('//input[contains(@placeholder, "Search")]')
  await clickOn(searchField, 1)
  await deleteTextWithBackspaces(searchField, 100)
}
