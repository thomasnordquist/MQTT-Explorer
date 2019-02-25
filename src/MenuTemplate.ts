import { Menu, app, BrowserWindow, webContents } from 'electron'
import openAboutWindow from 'about-window'
import * as path from 'path'

const applicationMenu = {
  label: 'Application',
  submenu: [
    {
      label: 'About Application',
      click: () => {
        openAboutWindow({
          icon_path: path.join(__dirname, '..', '..', 'icon.png'),
          license: 'AGPL-3.0',
          homepage: 'https://thomasnordquist.github.io/MQTT-Explorer/',
          bug_report_url: 'https://github.com/thomasnordquist/MQTT-Explorer/issues',
          description: 'Author: Thomas Nordquist',
        })
      },
    },
    {
      type: 'separator' as 'separator',
    },
    {
      label: 'Dev Tools',
      accelerator: 'CmdOrCtrl+Alt+I',
      role: 'toggleDevTools',
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => {
        app.quit()
      },
    },
  ],
}

const editMenu = {
  label: 'Edit',
  submenu: [
    {
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      selector: 'undo:',
    },
    {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      selector: 'redo:',
    },
    {
      type: 'separator' as 'separator',
    },
    {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      selector: 'cut:',
    },
    {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      selector: 'copy:',
    },
    {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      selector: 'paste:',
    },
    {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      selector: 'selectAll:',
    },
  ],
}

const viewMenu = {
  label: 'View',
  submenu: [
    {
      label: 'Default size',
      accelerator: 'CmdOrCtrl+0',
      click: () => {
        const window = BrowserWindow.getFocusedWindow()
        if (window) {
          window.webContents.setZoomFactor(1)
        }
      },
    },
    {
      label: 'Increase size',
      accelerator: 'CmdOrCtrl+Plus',
      click: () => {
        const window = BrowserWindow.getFocusedWindow()
        if (window) {
          window.webContents.getZoomFactor((zoom) => {
            window.webContents.setZoomFactor(Math.min(zoom + 0.1, 2.0))
          })
        }
      },
    },
    {
      label: 'Reduce size',
      accelerator: 'CmdOrCtrl+-',
      click: () => {
        const window = BrowserWindow.getFocusedWindow()
        if (window) {
          window.webContents.getZoomFactor((zoom) => {
            window.webContents.setZoomFactor(Math.max(zoom - 0.1, 0.5))
          })
        }
      },
    },
  ],
}

const template = [
  applicationMenu,
  editMenu,
  viewMenu,
]

export const menuTemplate = Menu.buildFromTemplate(template)
