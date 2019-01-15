const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require("electron-updater")
const log = require('electron-log');
const { ConnectionManager, updateNotifier } = require('./backend/build/backend/src/index.js')
const fs = require('fs')
const path = require('path')

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const connectionManager = new ConnectionManager()
connectionManager.manageConnections()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  const icon = path.join(__dirname, 'icon.png')
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    icon
  })

  console.log(icon)
  // and load the index.html of the app.
  mainWindow.loadFile('app/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('close', function () {
    connectionManager.closeAllConnections()
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    app.quit()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()

  let updateInfo
  autoUpdater.on('update-available', (info) => {
    updateInfo = info
  })

  autoUpdater.on('error', () => {
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
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
