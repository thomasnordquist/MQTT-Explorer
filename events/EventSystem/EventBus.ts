// Conditional export based on environment
import { EventBusInterface } from './EventBusInterface'
import { Rpc } from './Rpc'

// Check if we're in a browser or Electron environment
function isElectronRenderer(): boolean {
  if (typeof window !== 'undefined' && (window as any).process?.type === 'renderer') {
    return true
  }
  return false
}

function isElectronMain(): boolean {
  if (typeof process !== 'undefined' && process.versions?.electron && process.type === 'browser') {
    return true
  }
  return false
}

let rendererEvents: EventBusInterface
let backendEvents: EventBusInterface
let rendererRpc: Rpc
let backendRpc: Rpc

// Initialize based on environment
if (isElectronRenderer() || (typeof process !== 'undefined' && process.versions?.electron)) {
  // Electron environment - use IPC
  try {
    const electron = require('electron')
    const { IpcRendererEventBus } = require('./IpcRendererEventBus')
    const { IpcMainEventBus } = require('./IpcMainEventBus')

    if (electron.ipcRenderer) {
      rendererEvents = new IpcRendererEventBus(electron.ipcRenderer)
      rendererRpc = new Rpc(rendererEvents)
    }

    if (electron.ipcMain) {
      backendEvents = new IpcMainEventBus(electron.ipcMain)
      backendRpc = new Rpc(backendEvents)
    }
  } catch (e) {
    // Electron not available, fall through to browser mode
  }
}

if (!rendererEvents) {
  // Browser environment - use Socket.io
  if (typeof window !== 'undefined') {
    const io = require('socket.io-client')
    const { SocketIOClientEventBus } = require('./SocketIOClientEventBus')

    // Get auth from sessionStorage or prompt
    const username = sessionStorage.getItem('mqtt-explorer-username') || ''
    const password = sessionStorage.getItem('mqtt-explorer-password') || ''

    const socket = io({
      auth: {
        username,
        password,
      },
    })

    rendererEvents = new SocketIOClientEventBus(socket)
    rendererRpc = new Rpc(rendererEvents)
  }
}

// Export the initialized instances
export { rendererEvents, backendEvents, rendererRpc, backendRpc }
