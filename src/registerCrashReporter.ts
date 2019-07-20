const { crashReporter } = require('electron')

export function registerCrashReporter() {
  crashReporter.start({
    productName: 'MQTT Explorer',
    companyName: 'thomasnordquist',
    submitURL: 'http://app-telemetry.t7n.de/app/crash/mqttexplorer',
    uploadToServer: true,
  })
}
