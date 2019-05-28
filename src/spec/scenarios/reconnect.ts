import { clickOn } from '../util'
import { Browser } from 'webdriverio'

export async function reconnect(browser: Browser) {
  const disconnectButton = await browser.$('//button/span[contains(text(),"Disconnect")]')
  await clickOn(disconnectButton, browser)
  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton, browser)
}
