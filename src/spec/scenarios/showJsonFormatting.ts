import { clickOn, sleep, writeText, delteTextWithBackspaces, expandTopic, moveToCenterOfElement, showText } from '../util'
import { Browser } from 'webdriverio'

export async function showJsonFormatting(browser: Browser<void>) {
  const payloadInput = await browser.$('//*[contains(@class, "ace_text-input")]')
  await clickOn(payloadInput, browser)
  await payloadInput.clearValue()
  await writeTextPayload(payloadInput, '{"action": "setState", "state": "on" }')
}

async function writeTextPayload(payloadInput: any, text: string) {
  const chars = text.split('')
  for (const char of chars) {
    await payloadInput.setValue(char)
    await sleep(200)
  }
}
