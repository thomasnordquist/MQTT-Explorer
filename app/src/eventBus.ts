/**
 * Event bus abstraction layer
 * Provides the correct rendererRpc and rendererEvents implementation based on runtime environment
 * - In browser mode: uses Socket.IO-based event bus
 * - In Electron mode: uses IPC-based event bus
 *
 * This module uses dynamic imports to avoid bundling unused dependencies.
 */

import type { Rpc } from '../../events/EventSystem/Rpc'
import type { EventBusInterface } from '../../events/EventSystem/EventBusInterface'
import { isBrowserMode } from './utils/browserMode'

let rendererRpcInstance: Rpc<any> | null = null
let rendererEventsInstance: EventBusInterface | null = null
let backendRpcInstance: Rpc<any> | null = null
let backendEventsInstance: EventBusInterface | null = null

/**
 * Get the renderer RPC instance
 * Lazy-loads the appropriate implementation based on environment
 */
export function getRendererRpc(): Rpc<any> {
  if (rendererRpcInstance) {
    return rendererRpcInstance
  }

  if (isBrowserMode) {
    // Dynamic import for browser mode
    const browserEventBus = require('./browserEventBus')
    rendererRpcInstance = browserEventBus.rendererRpc
  } else {
    // Dynamic import for Electron mode
    const electronEventBus = require('../../events/EventSystem/EventBus')
    rendererRpcInstance = electronEventBus.rendererRpc
  }

  return rendererRpcInstance
}

/**
 * Get the renderer events instance
 * Lazy-loads the appropriate implementation based on environment
 */
export function getRendererEvents(): EventBusInterface {
  if (rendererEventsInstance) {
    return rendererEventsInstance
  }

  if (isBrowserMode) {
    // Dynamic import for browser mode
    const browserEventBus = require('./browserEventBus')
    rendererEventsInstance = browserEventBus.rendererEvents
  } else {
    // Dynamic import for Electron mode
    const electronEventBus = require('../../events/EventSystem/EventBus')
    rendererEventsInstance = electronEventBus.rendererEvents
  }

  return rendererEventsInstance
}

/**
 * Get the backend RPC instance (for compatibility)
 */
export function getBackendRpc(): Rpc<any> {
  if (backendRpcInstance) {
    return backendRpcInstance
  }

  if (isBrowserMode) {
    // In browser mode, backend is accessed via socket.io
    const browserEventBus = require('./browserEventBus')
    backendRpcInstance = browserEventBus.backendRpc
  } else {
    // In Electron mode, backend RPC uses IPC
    const electronEventBus = require('../../events/EventSystem/EventBus')
    backendRpcInstance = electronEventBus.backendRpc
  }

  return backendRpcInstance
}

/**
 * Get the backend events instance (for compatibility)
 */
export function getBackendEvents(): EventBusInterface {
  if (backendEventsInstance) {
    return backendEventsInstance
  }

  if (isBrowserMode) {
    // In browser mode, backend is accessed via socket.io
    const browserEventBus = require('./browserEventBus')
    backendEventsInstance = browserEventBus.backendEvents
  } else {
    // In Electron mode, backend events use IPC
    const electronEventBus = require('../../events/EventSystem/EventBus')
    backendEventsInstance = electronEventBus.backendEvents
  }

  return backendEventsInstance
}

// Export as named constants for convenience (lazy-loaded on first access)
export const rendererRpc = new Proxy({} as Rpc<any>, {
  get(target, prop) {
    return getRendererRpc()[prop as keyof Rpc<any>]
  },
})

export const rendererEvents = new Proxy({} as EventBusInterface, {
  get(target, prop) {
    return getRendererEvents()[prop as keyof EventBusInterface]
  },
})

export const backendRpc = new Proxy({} as Rpc<any>, {
  get(target, prop) {
    return getBackendRpc()[prop as keyof Rpc<any>]
  },
})

export const backendEvents = new Proxy({} as EventBusInterface, {
  get(target, prop) {
    return getBackendEvents()[prop as keyof EventBusInterface]
  },
})

// Re-export all event definitions that are shared
export * from '../../events/Events'
export * from '../../events/EventsV2'
export * from '../../events/EventSystem/EventDispatcher'
export * from '../../events/EventSystem/EventBusInterface'
