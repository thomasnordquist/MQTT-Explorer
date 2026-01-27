// Auto-connect handler for browser mode
// This file is loaded early in the app initialization to handle server-initiated auto-connect

import * as q from '../../backend/src/Model'
import { DataSourceState } from 'mqtt-explorer-backend/src/DataSource/DataSource'
import { store } from './store'
import { TopicViewModel } from './model/TopicViewModel'
import { showTree } from './actions/Tree'
import { connecting, connected } from './actions/Connection'
import { makeConnectionStateEvent, rendererEvents } from './eventBus'

// Listen for auto-connect-initiated event from server
if (typeof window !== 'undefined') {
  window.addEventListener('mqtt-auto-connect-initiated', ((event: CustomEvent) => {
    const { connectionId } = event.detail
    console.log('Auto-connect initiated from server, connectionId:', connectionId)

    // Dispatch connecting action
    store.dispatch(connecting(connectionId) as any)
    console.log('Dispatched connecting action')

    // Subscribe to connection state events
    const stateEvent = makeConnectionStateEvent(connectionId)
    console.log('Subscribing to connection state event:', stateEvent)

    rendererEvents.subscribe(stateEvent, (dataSourceState: DataSourceState) => {
      console.log('Auto-connect state update:', JSON.stringify(dataSourceState, null, 2))

      if (dataSourceState.connected) {
        console.log('Auto-connect: connection established!')
        const state = store.getState()
        const didReconnect = Boolean(state.connection.tree)
        if (!didReconnect) {
          // Create tree and update with connection
          console.log('Creating tree for connection:', connectionId)
          const tree = new q.Tree<TopicViewModel>()
          tree.updateWithConnection(rendererEvents, connectionId)
          store.dispatch(showTree(tree) as any)
          store.dispatch(connected(tree, 'auto-connect') as any)
          console.log('Auto-connect successful, tree created and dispatched')
        }
      } else if (dataSourceState.error) {
        console.error('Auto-connect error:', dataSourceState.error)
      }
    })
    console.log('Auto-connect handler setup complete')
  }) as EventListener)
}
