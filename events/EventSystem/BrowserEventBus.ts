// Browser-specific EventBus implementation using Socket.io
import * as io from 'socket.io-client'
import { SocketIOClientEventBus } from './SocketIOClientEventBus'
import { Rpc } from './Rpc'

// Connect to the server (same origin in browser mode)
const socket = io()

export const rendererEvents = new SocketIOClientEventBus(socket)
export const rendererRpc = new Rpc(rendererEvents)

// In browser mode, there's no separate backend - it's on the server
// These exports are for compatibility but won't be used client-side
export const backendEvents = rendererEvents
export const backendRpc = rendererRpc
