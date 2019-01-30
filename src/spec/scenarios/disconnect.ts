import { clickOn } from '../util'
import { Browser } from 'webdriverio'

export async function disconnect(browser: Browser<void>) {
  const connectButton = await browser.$('//button/span[contains(text(),"Disconnect")]')
  clickOn(connectButton, browser)
}
