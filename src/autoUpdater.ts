import { autoUpdater } from 'electron-updater'
import { BuildInfo } from 'electron-telemetry/build/Model'
import { UpdateInfo } from '../events'
import { updateNotifier } from '../backend/src/index'

export function shouldUpdate(build: BuildInfo) {
  return build.package !== 'portable'
}

export function handleAutoUpdate() {
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('There is an update available')
  })

  autoUpdater.on('error', () => {
    console.log('could not update due to error')
  })

  updateNotifier.onCheckUpdateRequest.subscribe(() => {
    try {
      autoUpdater.checkForUpdatesAndNotify()
    } catch (error) {
      console.error(error)
    }
  })
}
