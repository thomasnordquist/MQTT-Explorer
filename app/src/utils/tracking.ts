// import { electronRendererTelemetry } from 'electron-telemetry'

// Used to determine long-time-stability and memory leaks
function trackProcessStatistics() {
  setInterval(() => {
    try {
      electronRendererTelemetry.trackCustomEvent({
        name: 'heapStatistics',
        payload: process.getHeapStatistics(),
      })
      electronRendererTelemetry.trackCustomEvent({
        name: 'cpuUsage',
        payload: process.getCPUUsage(),
      })
      electronRendererTelemetry.trackCustomEvent({
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
  const blacklist = ['CONNECTION_SET_HEALTH']
  if (blacklist.indexOf(name) === -1) {
    // electronRendererTelemetry.trackEvent(name)
  }
}
