import { Menu, app, BrowserWindow, webContents } from 'electron'

const applicationMenu = {
  label: 'Application',
  submenu: [
    {
      label: 'About Application',
      selector: 'orderFrontStandardAboutPanel:',
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
