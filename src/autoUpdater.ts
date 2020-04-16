import { autoUpdater, UpdateInfo } from 'electron-updater'
import { BuildInfo } from 'electron-telemetry/build/Model'

export function shouldAutoUpdate(build: BuildInfo) {
  return (
    build.package !== 'portable' &&
    build.package !== 'appx' &&
    build.package !== 'snap' &&
    build.package !== 'mas' &&
    build.platform !== 'mac'
  )
}

export function handleAutoUpdate() {
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('There is an update available')
  })

  autoUpdater.on('error', error => {
    console.error('could not update due to error', error)
  })

  try {
    autoUpdater.checkForUpdatesAndNotify()
  } catch (error) {
    console.error(error)
  }
}
