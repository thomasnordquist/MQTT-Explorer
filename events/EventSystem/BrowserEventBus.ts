// Browser-specific EventBus implementation using Socket.io
import io from 'socket.io-client'
import { SocketIOClientEventBus } from './SocketIOClientEventBus'
import { Rpc } from './Rpc'

// Get auth from sessionStorage or use empty (will show login dialog)
const username = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mqtt-explorer-username') || '' : ''
const password = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mqtt-explorer-password') || '' : ''

// Connect to the server (same origin in browser mode)
const socket = io({
  auth: {
    username,
    password,
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling'],
})

export const rendererEvents = new SocketIOClientEventBus(socket)
export const rendererRpc = new Rpc(rendererEvents)

// In browser mode, the backend is on the server
// For compatibility, export same instances (renderer communicates with server backend via socket)
export const backendEvents = rendererEvents
export const backendRpc = rendererRpc
