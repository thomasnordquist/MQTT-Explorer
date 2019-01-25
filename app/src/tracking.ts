let userId = window.localStorage.getItem('userId')
const sha1 = require('sha1')
import { electronRendererTelementry } from 'electron-telemetry'

if (!userId) {
  userId = sha1(sha1(Math.random()) + sha1(performance.now()) + sha1(Date.now())).slice(0, 8) as string
  window.localStorage.setItem('userId', userId)
}

setInterval(() => {
  try {
    electronRendererTelementry.trackCustomEvent({ name: 'heapStatistics', payload: process.getHeapStatistics() })
    electronRendererTelementry.trackCustomEvent({ name: 'cpuUsage', payload: process.getCPUUsage() })
    electronRendererTelementry.trackCustomEvent({ name: 'runningSince', payload: performance.now() })
  } catch (error) {
    console.error(error)
  }
}, 60 * 1000)

export function trackEvent(name: string) {
  if (name.match(/^@@redux/)) {
    return
  }
  electronRendererTelementry.trackEvent(name)
}
