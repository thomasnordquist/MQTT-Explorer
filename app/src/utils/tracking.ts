import { electronRendererTelementry } from 'electron-telemetry'

// Used to determine long-time-stability and memory leaks
function trackProcessStatistics() {
  setInterval(() => {
    try {
      electronRendererTelementry.trackCustomEvent({
        name: 'heapStatistics',
        payload: process.getHeapStatistics(),
      })
      electronRendererTelementry.trackCustomEvent({
        name: 'cpuUsage',
        payload: process.getCPUUsage(),
      })
      electronRendererTelementry.trackCustomEvent({
        name: 'runningSince',
        payload: performance.now(),
      })
    } catch (error) {
      console.error(error)
    }
  }, 60 * 1000)
}
trackProcessStatistics()

// Log reducer event names to determine what functionality is used and how to reproduce reported errors
export function trackEvent(name: string) {
  if (name.match(/^@@redux/)) {
    return
  }
  // electronRendererTelementry.trackEvent(name)
}
