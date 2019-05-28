import { sleep, showKeys, showText } from '../util'
import { Browser } from 'webdriverio'

export async function showZoomLevel(browser: Browser) {
  await showKeys('Zoom in', 2000, browser, 'top', ['Ctrl', '+'])
  await sleep(2000)
  await showKeys('Zoom out', 2000, browser, 'middle', ['Ctrl', '-'])
  await sleep(2000)
  await showKeys('Reset zoom level', 2000, browser, 'bottom', ['Ctrl', 'Zero'])
  await sleep(2000)
}
