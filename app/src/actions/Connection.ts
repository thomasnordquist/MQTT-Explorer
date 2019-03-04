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
import { MqttOptions, DataSourceState } from '../../../backend/src/DataSource'
import { showTree } from './Tree'
import { TopicViewModel } from '../TopicViewModel'
import { showError } from './Global'
import { globalActions } from '.';

export const connect = (options: MqttOptions, connectionId: string) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  dispatch(connecting(connectionId))
  rendererEvents.emit(addMqttConnectionEvent, { options, id: connectionId })
  const event = makeConnectionStateEvent(connectionId)
  const host = url.parse(options.url).hostname

  rendererEvents.subscribe(event, (dataSourceState) => {
    console.log(dataSourceState)
    if (dataSourceState.connected) {
      const didReconnect = Boolean(getState().connection.tree)
      if (!didReconnect) {
        const tree = new q.Tree<TopicViewModel>()
        tree.updateWithConnection(rendererEvents, connectionId)
        dispatch(showTree(tree))
        dispatch(connected(tree, host!))
      }
    } else if (dataSourceState.error) {
      dispatch(showError(dataSourceState.error))
      dispatch(disconnect())
    }
    dispatch(updateHealth(dataSourceState))
  })
}

const updateHealth = (dataSourceState: DataSourceState) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  let state
  if (dataSourceState.connecting) {
    state = 'connecting'
  } else if (!dataSourceState.connected) {
    state = 'offline'
    dispatch(globalActions.showError('Disconnected from server'))
  } else if (dataSourceState.connected) {
    state = 'online'
  } else {
    state = undefined
  }

  console.log(state)

  dispatch({
    type: ActionTypes.CONNECTION_SET_HEALTH,
    health: state,
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

export const disconnect = () => (dispatch: Dispatch<any>, getState: () => AppState)  => {
  const { connectionId, tree } = getState().connection
  if (connectionId) {
    rendererEvents.emit(removeConnection, connectionId)
    rendererEvents.unsubscribeAll(makeConnectionStateEvent(connectionId))
  }

  tree && tree.stopUpdating()

  dispatch(showTree(undefined))
  dispatch({
    type: ActionTypes.CONNECTION_SET_DISCONNECTED,
  })
}
