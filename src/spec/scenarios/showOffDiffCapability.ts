import { Page, Locator } from 'playwright'
import { clickOn, showText, sleep } from '../util'

// Expects a topic with at least two messages to be selected
export async function showOffDiffCapability(browser: Page) {
  await showText('Compare messages', 2000, browser, 'top')

  await showText('Show raw message', 2000, browser, 'bottom')
  const rawMessage = await browser.locator('#valueRendererDisplayMode-raw')
  await clickOn(rawMessage)
  await sleep(1000)

  await showText('Compare with others', 2000, browser, 'bottom')
  const diffMessages = await browser.locator('#valueRendererDisplayMode-diff')
  await clickOn(diffMessages)

  // // const firstEntry = await browser.$('//span[contains(text(), "History")]/../../div/div[1]/div')
  // const secondEntry = await browser.$('//span[contains(text(), "History")]/../../div/div[2]/div')
  // await clickOn(secondEntry, browser)
  // await sleep(2000)
}
