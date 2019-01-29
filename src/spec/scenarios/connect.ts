import { clickOn, sleep, writeText } from '../util'
import { Browser } from 'webdriverio'

export async function connectTo(host: string, browser: Browser<void>) {
  await writeTextToInput('Host', host, browser)
  await writeTextToInput('Username', 'thomas', browser, false)
  await writeTextToInput('Password', 'bierbier', browser, false)

  const connectButton = await browser.$('//button/span[contains(text(),"Connect")]')
  clickOn(connectButton, browser)
}

async function writeTextToInput(name: string, text: string, browser: Browser<void>, wait: boolean = true) {
  const input = await browser.$(`//label[contains(text(), "${name}")]/..//input`)
  await clickOn(input, browser, 1)
  wait && await sleep(500)
  input.clearValue()
  wait && await sleep(300)
  await writeText(text, input)
}
