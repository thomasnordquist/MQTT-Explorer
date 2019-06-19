import { electronRendererTelemetry } from 'electron-telemetry'

const telemetry = electronRendererTelemetry
electronRendererTelemetry.registerErrorHandler()
