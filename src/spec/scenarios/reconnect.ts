import { Browser, Element } from 'webdriverio'
import { clickOn } from '../util'

export async function reconnect(browser: Browser<'async'>) {
  const disconnectButton = await browser.$('//button/span[contains(text(),"Disconnect")]')
  await clickOn(disconnectButton, browser)
  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton, browser)
}
