import { ActionTypes, Action, ConnectionState } from '../reducers/Connection'
import { MqttOptions } from '../../../backend/src/DataSource'
import { Dispatch } from 'redux'
import { rendererEvents, addMqttConnectionEvent, makeConnectionStateEvent, removeConnection } from '../../../events'
import { AppState } from '../reducers'
import * as q from '../../../backend/src/Model'

export const connect = (options: MqttOptions, connectionId: string) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  dispatch(connecting(connectionId))
  rendererEvents.emit(addMqttConnectionEvent, { options, id: connectionId })
  const event = makeConnectionStateEvent(connectionId)
  rendererEvents.subscribe(event, (dataSourceState) => {
    if (dataSourceState.connected) {
      const tree = new q.Tree()
      tree.updateWithConnection(rendererEvents, connectionId)
      dispatch(connected(tree))
    } else if (dataSourceState.error) {
      dispatch(showError(dataSourceState.error))
      dispatch(disconnect())
    }
  })
}

export const connected: (tree: q.Tree) => Action = (tree: q.Tree)  => ({
  tree,
  type: ActionTypes.CONNECTION_SET_CONNECTED,
})

export const connecting: (connectionId: string) => Action = (connectionId: string)  => ({
  connectionId,
  type: ActionTypes.CONNECTION_SET_CONNECTING,
})

export const showError = (error?: string) => ({
  error,
  type: ActionTypes.CONNECTION_SET_SHOW_ERROR,
})

export const disconnect = () => (dispatch: Dispatch<Action>, getState: () => AppState)  => {
  const { connectionId, tree } = getState().connection
  rendererEvents.emit(removeConnection, connectionId)
  tree && tree.stopUpdating()

  dispatch({
    type: ActionTypes.CONNECTION_SET_DISCONNECTED,
  })
}
