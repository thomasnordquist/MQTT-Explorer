import { Browser, Element } from 'webdriverio'
import { clickOn } from '../util'

export async function disconnect(browser: Browser<'async'>) {
  const disconnectButton = await browser.$('//button/span[contains(text(),"Disconnect")]')
  await clickOn(disconnectButton, browser)
}
