import axios from 'axios'

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

export function isDev() {
  return Boolean(process.argv.find(arg => arg === '--development'))
}

export function runningUiTestOnCi() {
  return Boolean(process.argv.find(arg => arg === '--runningUiTestOnCi'))
}
