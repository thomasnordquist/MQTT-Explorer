import { clickOn, sleep, showText } from '../util'
import { Browser } from 'webdriverio'

// Expects a topic with at least two messages to be selected
export async function showOffDiffCapability(browser: Browser) {
  await showText('Compare messages', 2000, browser, 'top')

  await showText('Show raw message', 2000, browser, 'bottom')
  const rawMessage = await browser.$('#valueRendererDisplayMode-raw')
  await clickOn(rawMessage, browser)
  await sleep(1000)

  await showText('Compare with others', 2000, browser, 'bottom')
  const diffMessages = await browser.$('#valueRendererDisplayMode-diff')
  await clickOn(diffMessages, browser)

  // // const firstEntry = await browser.$('//span[contains(text(), "History")]/../../div/div[1]/div')
  // const secondEntry = await browser.$('//span[contains(text(), "History")]/../../div/div[2]/div')
  // await clickOn(secondEntry, browser)
  // await sleep(2000)
}
