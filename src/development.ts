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

export function enableMcpIntrospection() {
  return Boolean(process.argv.find(arg => arg === '--enable-mcp-introspection'))
}

export function getRemoteDebuggingPort() {
  const portArg = process.argv.find(arg => arg.startsWith('--remote-debugging-port='))
  if (portArg) {
    const parts = portArg.split('=')
    if (parts.length === 2 && parts[1]) {
      const port = parseInt(parts[1], 10)
      // Return the port only if it's a valid number between 1 and 65535
      if (!isNaN(port) && port > 0 && port <= 65535) {
        return port
      }
    }
  }
  return enableMcpIntrospection() ? 9222 : undefined
}
