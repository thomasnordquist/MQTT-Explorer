import * as fs from 'fs'
import * as log from 'electron-log'
import * as path from 'path'
import ConfigStorage from '../backend/src/ConfigStorage'
import { app, BrowserWindow, Menu } from 'electron'
import { autoUpdater } from 'electron-updater'
import { BuildInfo } from 'electron-telemetry/build/Model'
import { ConnectionManager, updateNotifier } from '../backend/src/index'
import { electronTelemetryFactory } from 'electron-telemetry'
import { menuTemplate } from './MenuTemplate'
import { UpdateInfo } from '../events'

const isDev = Boolean(process.argv.find(arg => arg === '--development'))

if (!isDev) {
  let buildOptions: BuildInfo = ({ platform: process.platform, package: 'unpacked' } as any)
  try {
    const options = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'buildOptions.json')).toString())
    if (typeof options.platform === 'string' && typeof options.package === 'string') {
      buildOptions = options
    }
  } catch (ignore) {}

  console.log(buildOptions)
  const electronTelemetry = electronTelemetryFactory('9b0c8ca04a361eb8160d98c5', buildOptions)
}

// const isDebugEnabled = Boolean(process.argv.find(arg => arg === 'debug'))
const runningUiTestOnCi = Boolean(process.argv.find(arg => arg === '--runningUiTestOnCi'))

autoUpdater.logger = log
log.info('App starting...')

const connectionManager = new ConnectionManager()
connectionManager.manageConnections()

const configStorage = new ConfigStorage(path.join(app.getPath('appData'), app.getName(), 'settings.json'))
configStorage.init()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | undefined

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png')
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
    icon: iconPath,
  })

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      runningUiTestOnCi && mainWindow.setFullScreen(true)
      mainWindow.show()
    }
  })

  console.log('icon path', iconPath)
  // and load the index.html of the app.
  mainWindow.loadFile('app/build/index.html')

  // Emitted when the window is closed.
  mainWindow.on('close', () => {
    connectionManager.closeAllConnections()
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = undefined
    app.quit()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  Menu.setApplicationMenu(menuTemplate)
  createWindow()

  let updateInfo: UpdateInfo
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('there is an update')
    updateInfo = info
  })

  autoUpdater.on('error', () => {
    console.log('could not update due to error')

    if (updateInfo) {
      updateNotifier.notify(updateInfo)
    }
  })

  updateNotifier.onCheckUpdateRequest.subscribe(() => {
    try {
      autoUpdater.checkForUpdatesAndNotify()
    } catch (error) {
      console.error(error)
    }
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
