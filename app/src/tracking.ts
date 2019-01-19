import { rendererEvents } from '../../events'
let userId = window.localStorage.getItem('userId')
const sha1 = require('sha1')
import { electronRendererTelementry } from 'electron-telemetry'

if (!userId) {
  userId = sha1(sha1(Math.random()) + sha1(performance.now()) + sha1(Date.now())).slice(0, 8) as string
  window.localStorage.setItem('userId', userId)
}

const Nucleus = require('electron-nucleus')('5c3b3e0443b7cc00eec3782b', {
  userId,
  disableInDev: true,
})

export default Nucleus

export function trackEvent(name: string) {
  if (name.match(/^@@redux/)) {
    return
  }
  Nucleus.track(name)
  electronRendererTelementry.trackEvent(name)
}
