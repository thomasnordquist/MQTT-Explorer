import { electronRendererTelementry } from 'electron-telemetry'

const telemetry = electronRendererTelementry
electronRendererTelementry.registerErrorHandler()
