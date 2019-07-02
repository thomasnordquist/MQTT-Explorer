const { crashReporter } = require('electron')

export function registerCrashReporter() {
  crashReporter.start({
    productName: 'MQTT Explorer',
    companyName: 'thomasnordquist',
    submitURL: 'http://localhost:3000/app/crash/mqttexplorer',
    uploadToServer: true,
  })
}
