import { ipcMain, ipcRenderer } from 'electron'

import { IpcMainEventBus } from './IpcMainEventBus'
import { IpcRendererEventBus } from './IpcRendererEventBus'
import { Rpc } from './Rpc'

export const rendererEvents = new IpcRendererEventBus(ipcRenderer)
export const backendEvents = new IpcMainEventBus(ipcMain)

// Preferred way to communicate typesafe
export const rendererRpc = new Rpc(rendererEvents)
export const backendRpc = new Rpc(backendEvents)
