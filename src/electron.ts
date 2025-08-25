import * as log from 'electron-log'
import * as path from 'path'
import ConfigStorage from '../backend/src/ConfigStorage'
import { app, BrowserWindow, Tray, Menu, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { ConnectionManager } from '../backend/src/index'
import { promises as fsPromise } from 'fs'
// import { electronTelemetryFactory } from 'electron-telemetry'
import { menuTemplate } from './MenuTemplate'
import buildOptions from './buildOptions'
import { waitForDevServer, isDev, runningUiTestOnCi, loadDevTools } from './development'
import { shouldAutoUpdate, handleAutoUpdate } from './autoUpdater'
import { registerCrashReporter } from './registerCrashReporter'
import { makeOpenDialogRpc, makeSaveDialogRpc } from '../events/OpenDialogRequest'
import { backendRpc, getAppVersion, writeToFile, readFromFile } from '../events'

registerCrashReporter()

// if (!isDev() && !runningUiTestOnCi()) {
//   const electronTelemetry = electronTelemetryFactory('9b0c8ca04a361eb8160d98c5', buildOptions)
// }

// disable-dev-shm-usage is required to run the debug console
app.commandLine.appendSwitch('--no-sandbox --disable-dev-shm-usage')
app.whenReady().then(() => {
  backendRpc.on(makeOpenDialogRpc(), async request => {
    return dialog.showOpenDialog(BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0], request)
  })

  backendRpc.on(makeSaveDialogRpc(), async request => {
    return dialog.showSaveDialog(BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0], request)
  })

  backendRpc.on(getAppVersion, async () => app.getVersion())

  backendRpc.on(writeToFile, async ({ filePath, data, encoding }) => {
    await fsPromise.writeFile(filePath, Buffer.from(data, 'base64'), { encoding })
  })

  backendRpc.on(readFromFile, async ({ filePath, encoding }) => {
    return fsPromise.readFile(filePath, { encoding })
  })
})

autoUpdater.logger = log
log.info('App starting...')

const connectionManager = new ConnectionManager()
connectionManager.manageConnections()

const configStorage = new ConfigStorage(path.join(app.getPath('userData'), 'settings.json'))
configStorage.init()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | undefined
let tray: Tray | undefined

async function createWindow() {
  if (isDev()) {
    await waitForDevServer()
    loadDevTools()
  }

  const iconPath = path.join(__dirname, '..', '..', 'icon.png')
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    show: false,
    webPreferences: {
      ...({ enableRemoteModule: true } as any),
      contextIsolation: false,
      nodeIntegration: true,
      devTools: true,
      sandbox: false,
    },
    icon: iconPath,
  })

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      runningUiTestOnCi() && mainWindow.setFullScreen(true)
      mainWindow.show()
    }
  })

  // Load the index.html of the app.
  if (isDev()) {
    mainWindow.loadURL('http://localhost:8080')
  } else {
    mainWindow.loadFile('app/build/index.html')
  }

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

  mainWindow.on('hide', () => {
    tray = new Tray(path.join(__dirname, '..', '..', 'icon.png'));
    tray.setContextMenu(Menu.buildFromTemplate([
      {
        label: 'Show App', click: function () {
          mainWindow?.show();
        }
      },
    ]));
  })

  mainWindow.on('show', () => {
    tray?.removeBalloon()
    tray?.destroy()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  Menu.setApplicationMenu(menuTemplate)
  createWindow()

  if (shouldAutoUpdate(buildOptions)) {
    handleAutoUpdate()
  }
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
