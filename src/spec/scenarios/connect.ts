import { clickOn, writeTextToInput } from '../util'
import { Browser } from 'webdriverio'

export async function connectTo(host: string, browser: Browser<void>) {
  await writeTextToInput('Host', host, browser)
  await writeTextToInput('Username', 'thomas', browser, false)
  await writeTextToInput('Password', 'bierbier', browser, false)

  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  clickOn(connectButton, browser)
}
