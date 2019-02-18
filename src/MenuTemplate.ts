import { Menu, app, BrowserWindow, webContents } from 'electron'
import openAboutWindow from 'about-window'
import * as path from 'path'

const applicationMenu = {
  label: 'Application',
  submenu: [
    {
      label: 'About Application',
      click: () => {
        console.log(path.join(__dirname, 'icon.png'))
        openAboutWindow({
          icon_path: path.join(__dirname, 'icon.png'),
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

const template = [
  applicationMenu,
  editMenu,
]

export const menuTemplate = Menu.buildFromTemplate(template)
