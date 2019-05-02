import { autoUpdater } from 'electron-updater'
import { BuildInfo } from 'electron-telemetry/build/Model'
import { UpdateInfo } from '../events'

export function shouldAutoUpdate(build: BuildInfo) {
  return build.package !== 'portable'
}

export function handleAutoUpdate() {
  // autoUpdater.on('update-available', (info: UpdateInfo) => {
  //   console.log('There is an update available')
  // })

  // autoUpdater.on('error', (error) => {
  //   console.error('could not update due to error', error)
  // })

  // try {
  //   autoUpdater.checkForUpdatesAndNotify()
  // } catch (error) {
  //   console.error(error)
  // }
}
