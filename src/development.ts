import * as os from 'os'
import * as path from 'path'
import axios from 'axios'
import { BrowserWindow } from 'electron'

export async function waitForDevServer() {
  let response

  while (!response) {
    try {
      response = await axios.get('http://localhost:8080')
    } catch {
      console.log('Waiting for dev server')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

export function loadDevTools() {
  /* spell-checker: disable */
  // Redux
  // BrowserWindow.addDevToolsExtension(
  //   path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0/')
  // )
  /* spell-checker: enable */
}

export function isDev() {
  return Boolean(process.argv.find(arg => arg === '--development'))
}

export function runningUiTestOnCi() {
  return Boolean(process.argv.find(arg => arg === '--runningUiTestOnCi'))
}
