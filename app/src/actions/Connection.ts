import * as q from '../../../backend/src/Model'
import * as url from 'url'
import { Action, ActionTypes } from '../reducers/Connection'
import {
  addMqttConnectionEvent,
  makeConnectionStateEvent,
  removeConnection,
  rendererEvents,
} from '../../../events'
import { AppState } from '../reducers'
import { Dispatch } from 'redux'
import { MqttOptions } from '../../../backend/src/DataSource'
import { showTree } from './Tree'
import { TopicViewModel } from '../TopicViewModel'

export const connect = (options: MqttOptions, connectionId: string) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  dispatch(connecting(connectionId))
  rendererEvents.emit(addMqttConnectionEvent, { options, id: connectionId })
  const event = makeConnectionStateEvent(connectionId)
  const host = url.parse(options.url).hostname

  rendererEvents.subscribe(event, (dataSourceState) => {
    console.log(dataSourceState)
    if (dataSourceState.connected) {
      const tree = new q.Tree<TopicViewModel>()
      tree.updateWithConnection(rendererEvents, connectionId)
      dispatch(connected(tree, host!))
      dispatch(showTree(tree))
    } else if (dataSourceState.error) {
      dispatch(showError(dataSourceState.error))
      dispatch(disconnect())
    }
  })
}

export const connected: (tree: q.Tree<TopicViewModel>, host: string) => Action = (tree: q.Tree<TopicViewModel>, host: string)  => ({
  tree,
  host,
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

export const disconnect = () => (dispatch: Dispatch<any>, getState: () => AppState)  => {
  const { connectionId, tree } = getState().connection
  rendererEvents.emit(removeConnection, connectionId)
  tree && tree.stopUpdating()

  dispatch(showTree(undefined))
  dispatch({
    type: ActionTypes.CONNECTION_SET_DISCONNECTED,
  })
}
