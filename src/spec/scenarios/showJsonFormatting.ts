import { Browser } from 'webdriverio'
import {
  clickOn,
  sleep
} from '../util'

export async function showJsonFormatting(browser: Browser<void>) {
  const editor = await browser.$('//*[contains(@class, "ace_editor")]')
  const formatJsonButton = await browser.$('#sidebar-publish-format-json')
  const payloadInput = await browser.$('//*[contains(@class, "ace_text-input")]')
  await clickOn(editor, browser)
  await browser.keys(['\uE009', 'A']) // Ctrl + A
  await browser.keys(['\uE000']) // End keyboard modifier
  await browser.keys(['\uE003']) // Backspace
  await sleep(500)
  await writeTextPayload(payloadInput, '{"action": "setState", "state": "on" }')
  await sleep(300)
  await clickOn(formatJsonButton, browser)
  await sleep(1200)

  const sidebarDrawer = await browser.$('#Sidebar')
  await sidebarDrawer.scrollIntoView()
}

async function writeTextPayload(payloadInput: any, text: string) {
  const chars = text.split('')
  for (const char of chars) {
    await payloadInput.setValue(char)
    await sleep(10)
  }
}
