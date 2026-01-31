// Browser-specific EventBus implementation using Socket.io
// This file contains the socket.io-client dependency which belongs in the app layer
import io, { Socket } from 'socket.io-client'
import { SocketIOClientEventBus } from '../../events/EventSystem/SocketIOClientEventBus'
import { Rpc } from '../../events/EventSystem/Rpc'

// Get auth from sessionStorage or use empty (will show login dialog)
let username = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mqtt-explorer-username') || '' : ''
let password = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mqtt-explorer-password') || '' : ''

// Connect to the server (same origin in browser mode)
const socket: Socket = io({
  auth: {
    username,
    password,
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling'],
  autoConnect: false, // Don't auto-connect, we'll connect manually after checking credentials
})

// Handle connection errors
socket.on('connect_error', error => {
  console.error('Socket connection error:', error.message)

  // Check if it's an authentication error
  if (
    error.message.includes('Invalid credentials') ||
    error.message.includes('Authentication required') ||
    error.message.includes('Too many')
  ) {
    // Clear invalid credentials from sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('mqtt-explorer-username')
      sessionStorage.removeItem('mqtt-explorer-password')
    }

    // Dispatch custom event that BrowserAuthWrapper can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mqtt-auth-error', {
          detail: { message: error.message },
        })
      )
    }
  }
})

socket.on('disconnect', reason => {
  console.log('Socket disconnected:', reason)
})

socket.on('connect', () => {
  console.log('Socket connected successfully')

  // Dispatch custom event that BrowserAuthWrapper can listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mqtt-auth-success', {
        detail: { message: 'Authentication successful' },
      })
    )
  }
})

// Listen for auth-status from server (sent on connection)
socket.on('auth-status', (data: { authDisabled: boolean }) => {
  console.log('Auth status received from server:', data)

  // Dispatch custom event with auth status
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mqtt-auth-status', {
        detail: { authDisabled: data.authDisabled },
      })
    )
  }
})

// Listen for auto-connect configuration from server
socket.on('auto-connect-config', (config: any) => {
  console.log('Auto-connect configuration received from server')

  // Dispatch custom event with auto-connect config
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mqtt-auto-connect-config', {
        detail: config,
      })
    )
  }
})

// Listen for auto-connect-initiated event from server
socket.on('auto-connect-initiated', (data: { connectionId: string }) => {
  console.log('Auto-connect initiated by server, connectionId:', data.connectionId)

  // Dispatch custom event to trigger connection flow
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('mqtt-auto-connect-initiated', {
        detail: data,
      })
    )
  }
})

// Listen for LLM availability from server (new architecture)
socket.on('llm-available', (data: { available: boolean }) => {
  console.log('LLM availability received from server:', data.available)

  // Store availability flag in window object
  if (typeof window !== 'undefined') {
    window.__llmAvailable = data.available

    // Dispatch custom event for components to react
    window.dispatchEvent(
      new CustomEvent('llm-availability-changed', {
        detail: { available: data.available },
      })
    )
  }
})

/**
 * Update socket authentication credentials and attempt to reconnect
 * @param newUsername New username
 * @param newPassword New password
 */
export function updateSocketAuth(newUsername: string, newPassword: string) {
  username = newUsername
  password = newPassword

  // Update socket auth
  socket.auth = {
    username: newUsername,
    password: newPassword,
  }

  // Store in sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('mqtt-explorer-username', newUsername)
    sessionStorage.setItem('mqtt-explorer-password', newPassword)
  }

  // Disconnect if connected, then reconnect with new credentials
  if (socket.connected) {
    socket.disconnect()
  }
  socket.connect()
}

/**
 * Connect the socket (used on initial page load)
 */
export function connectSocket() {
  if (!socket.connected) {
    socket.connect()
  }
}

export const rendererEvents = new SocketIOClientEventBus(socket)
export const rendererRpc = new Rpc(rendererEvents)

// Export socket instance for error monitoring
export const browserSocket = socket

// In browser mode, the backend is on the server
// For compatibility, export same instances (renderer communicates with server backend via socket)
export const backendEvents = rendererEvents
export const backendRpc = rendererRpc

// Re-export all events from the events module so imports work correctly
export * from '../../events/Events'
export * from '../../events/EventsV2'
export * from '../../events/EventSystem/EventDispatcher'
export * from '../../events/EventSystem/EventBusInterface'
