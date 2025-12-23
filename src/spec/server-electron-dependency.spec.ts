/**
 * Integration test to verify that the server and backend can be loaded
 * without requiring the electron module. This prevents regression of the
 * issue where events/index.ts exported EventBus which imported electron.
 */

import { expect } from 'chai'
import { describe, it } from 'mocha'

describe('Server Electron Dependency', () => {
  it('should load events module without requiring electron', () => {
    // This test ensures that importing from events/index doesn't pull in electron
    const events = require('../../events/index')
    
    // Verify we can import common events
    expect(events.addMqttConnectionEvent).to.exist
    expect(events.removeConnection).to.exist
    expect(events.EventDispatcher).to.exist
    
    // Verify that Electron-specific event buses are NOT exported
    expect(events.backendEvents).to.be.undefined
    expect(events.rendererEvents).to.be.undefined
    expect(events.backendRpc).to.be.undefined
    expect(events.rendererRpc).to.be.undefined
  })

  it('should load backend module without requiring electron', () => {
    // This test ensures the backend can be loaded in server mode
    const backend = require('../../backend/src/index')
    
    expect(backend.ConnectionManager).to.exist
    expect(typeof backend.ConnectionManager).to.equal('function')
  })

  it('should not have EventBus in events module exports', () => {
    // This test ensures that importing from events/index doesn't expose
    // Electron-specific event buses that would cause electron to be loaded
    const events = require('../../events/index')
    
    // Verify that Electron-specific event buses are NOT exported
    expect(events.backendEvents).to.be.undefined
    expect(events.rendererEvents).to.be.undefined
    expect(events.backendRpc).to.be.undefined
    expect(events.rendererRpc).to.be.undefined
  })

  it('should have EventBus available for Electron code via direct import', () => {
    // Electron code should still be able to import EventBus directly
    const eventBus = require('../../events/EventSystem/EventBus')
    
    expect(eventBus.backendEvents).to.exist
    expect(eventBus.rendererEvents).to.exist
    expect(eventBus.backendRpc).to.exist
    expect(eventBus.rendererRpc).to.exist
  })
})
