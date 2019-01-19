import { electronRendererTelementry } from 'electron-telemetry'

const spareMeFromGc = electronRendererTelementry
electronRendererTelementry.registerErrorHandler()