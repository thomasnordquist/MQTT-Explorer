import { clickOn, writeTextToInput } from '../util'
import { Browser } from 'webdriverio'

export async function connectTo(host: string, browser: Browser) {
  await writeTextToInput('Host', host, browser)
  await writeTextToInput('Username', 'thomas', browser, false)
  await writeTextToInput('Password', 'bierbier', browser, false)

  await browser.saveScreenshot('screen1.png')

  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  await clickOn(connectButton, browser)
}
