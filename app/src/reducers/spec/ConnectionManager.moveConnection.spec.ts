import 'mocha'
import { expect } from 'chai'
import { connectionManagerReducer, ConnectionManagerState, ActionTypes } from '../ConnectionManager'
import { createEmptyConnection } from '../../model/ConnectionOptions'

describe('ConnectionManager - moveConnection', () => {
  it('should move connection up', () => {
    const connection1 = { ...createEmptyConnection(), id: 'conn1', name: 'Connection 1', order: 0 }
    const connection2 = { ...createEmptyConnection(), id: 'conn2', name: 'Connection 2', order: 1 }
    const connection3 = { ...createEmptyConnection(), id: 'conn3', name: 'Connection 3', order: 2 }

    const initialState: ConnectionManagerState = {
      connections: {
        conn1: connection1,
        conn2: connection2,
        conn3: connection3,
      },
      selected: undefined,
      showAdvancedSettings: false,
      showCertificateSettings: false,
    }

    const action = {
      type: ActionTypes.CONNECTION_MANAGER_MOVE_CONNECTION,
      connectionId: 'conn2',
      direction: 'up' as 'up',
    }

    const newState = connectionManagerReducer(initialState, action)

    expect(newState.connections.conn1.order).to.equal(1)
    expect(newState.connections.conn2.order).to.equal(0)
    expect(newState.connections.conn3.order).to.equal(2)
  })

  it('should move connection down', () => {
    const connection1 = { ...createEmptyConnection(), id: 'conn1', name: 'Connection 1', order: 0 }
    const connection2 = { ...createEmptyConnection(), id: 'conn2', name: 'Connection 2', order: 1 }
    const connection3 = { ...createEmptyConnection(), id: 'conn3', name: 'Connection 3', order: 2 }

    const initialState: ConnectionManagerState = {
      connections: {
        conn1: connection1,
        conn2: connection2,
        conn3: connection3,
      },
      selected: undefined,
      showAdvancedSettings: false,
      showCertificateSettings: false,
    }

    const action = {
      type: ActionTypes.CONNECTION_MANAGER_MOVE_CONNECTION,
      connectionId: 'conn2',
      direction: 'down' as 'down',
    }

    const newState = connectionManagerReducer(initialState, action)

    expect(newState.connections.conn1.order).to.equal(0)
    expect(newState.connections.conn2.order).to.equal(2)
    expect(newState.connections.conn3.order).to.equal(1)
  })

  it('should not move connection up when already at top', () => {
    const connection1 = { ...createEmptyConnection(), id: 'conn1', name: 'Connection 1', order: 0 }
    const connection2 = { ...createEmptyConnection(), id: 'conn2', name: 'Connection 2', order: 1 }

    const initialState: ConnectionManagerState = {
      connections: {
        conn1: connection1,
        conn2: connection2,
      },
      selected: undefined,
      showAdvancedSettings: false,
      showCertificateSettings: false,
    }

    const action = {
      type: ActionTypes.CONNECTION_MANAGER_MOVE_CONNECTION,
      connectionId: 'conn1',
      direction: 'up' as 'up',
    }

    const newState = connectionManagerReducer(initialState, action)

    expect(newState.connections.conn1.order).to.equal(0)
    expect(newState.connections.conn2.order).to.equal(1)
  })

  it('should not move connection down when already at bottom', () => {
    const connection1 = { ...createEmptyConnection(), id: 'conn1', name: 'Connection 1', order: 0 }
    const connection2 = { ...createEmptyConnection(), id: 'conn2', name: 'Connection 2', order: 1 }

    const initialState: ConnectionManagerState = {
      connections: {
        conn1: connection1,
        conn2: connection2,
      },
      selected: undefined,
      showAdvancedSettings: false,
      showCertificateSettings: false,
    }

    const action = {
      type: ActionTypes.CONNECTION_MANAGER_MOVE_CONNECTION,
      connectionId: 'conn2',
      direction: 'down' as 'down',
    }

    const newState = connectionManagerReducer(initialState, action)

    expect(newState.connections.conn1.order).to.equal(0)
    expect(newState.connections.conn2.order).to.equal(1)
  })

  it('should handle non-existent connection', () => {
    const connection1 = { ...createEmptyConnection(), id: 'conn1', name: 'Connection 1', order: 0 }

    const initialState: ConnectionManagerState = {
      connections: {
        conn1: connection1,
      },
      selected: undefined,
      showAdvancedSettings: false,
      showCertificateSettings: false,
    }

    const action = {
      type: ActionTypes.CONNECTION_MANAGER_MOVE_CONNECTION,
      connectionId: 'nonexistent',
      direction: 'up' as 'up',
    }

    const newState = connectionManagerReducer(initialState, action)

    expect(newState.connections.conn1.order).to.equal(0)
  })
})
