let userId = window.localStorage.getItem('userId')
const sha1 = require('sha1')
import { electronRendererTelementry } from 'electron-telemetry'

if (!userId) {
  userId = sha1(sha1(Math.random()) + sha1(performance.now()) + sha1(Date.now())).slice(0, 8) as string
  window.localStorage.setItem('userId', userId)
}

export function trackEvent(name: string) {
  if (name.match(/^@@redux/)) {
    return
  }
  electronRendererTelementry.trackEvent(name)
}
