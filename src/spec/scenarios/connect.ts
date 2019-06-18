import { Browser, Element } from 'webdriverio'
import { clickOn, setTextInInput } from '../util'

export async function connectTo(host: string, browser: Browser) {
  await setTextInInput('Host', host, browser)

  await browser.saveScreenshot('screen1.png')

  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton, browser)
}
